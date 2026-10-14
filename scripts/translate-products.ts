/**
 * Machine-translates product content into the storefront's secondary locales
 * and stores it in Product.translations[<locale>].
 *
 *   npx tsx scripts/translate-products.ts            # all products missing lv
 *   npx tsx scripts/translate-products.ts --limit 20 # try a few first
 *   npx tsx scripts/translate-products.ts --force    # re-translate everything
 *
 * Resumable: products that already have a translation for the locale are
 * skipped unless --force is passed.
 */
import "dotenv/config";
import pg from "pg";
import OpenAI from "openai";

const LOCALE = "lv";
const LANGUAGE = "Latvian";
const BATCH_SIZE = 8;
const CONCURRENCY = 6;
const MODEL = process.env.TRANSLATE_MODEL || "gpt-5.4-mini";
const IS_REASONING = /^gpt-5|^o\d/.test(MODEL);

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL not set");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

const args = process.argv.slice(2);
const force = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : undefined;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new pg.Pool({ connectionString, max: CONCURRENCY + 1 });

interface SourceProduct {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  characteristics: unknown;
  brand: string | null;
}

interface TranslatedProduct {
  id: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  characteristics?: unknown;
}

const SYSTEM_PROMPT = `You are a professional e-commerce translator for nurvishop, an online home & lifestyle store selling to customers in Latvia.
Translate product content from English into natural, fluent ${LANGUAGE} as a native ${LANGUAGE} copywriter would write it for a web shop.

Rules:
- Correct ${LANGUAGE} grammar, cases and diacritics (ā č ē ģ ī ķ ļ ņ š ū ž). Never transliterate or drop diacritics.
- Product names: concise, GRAMMATICAL shop-style ${LANGUAGE} names — not a word-by-word calque of the English Title Case. English feed names stack attributes ("Napkins GC White Paper 100 Pieces"); in ${LANGUAGE} put material as a genitive/adjective before the noun and colour etc. after a comma, agreeing in gender/number, lowercase except the first word and brands. Examples:
  "Napkins GC White Paper 100 Pieces (32 Units)" → "Papīra salvetes GC, baltas, 100 gab. (32 iepakojumi)"
  "Wall mirror Golden 26 x 2 x 26 cm (3 Units)" → "Sienas spogulis, zelta krāsā, 26 x 2 x 26 cm (3 gab.)"
  "Laundry basket Versa Grey Polyester PVC Metal EVA 38 x 25 x 26 cm" → "Veļas grozs Versa, pelēks, poliesters/PVC/metāls/EVA, 38 x 25 x 26 cm"
  "Candle Lifetime" → "Svece Lifetime"
  Keep brand names, model names and codes exactly as is (e.g. "Versa", "DKD Home Decor", "Home ESPRIT", "3NDA90009"). Keep all measurements and numbers ("Ø 15 cm", "250 g", "1500 W").
- Descriptions: faithful, readable. If the English text runs specs together ("Colour: Golden Material: Crystal") keep the same "Label: value" sequence translated. If any HTML tags are present keep them unchanged.
- characteristics: if present, translate keys and textual values, keep the same JSON shape; keep numbers/units/brands.
- Never add information that is not in the source. Never translate the "id".
- Output fields that are null in the input as null.

Respond with JSON: {"products":[{"id","name","shortDescription","description","metaTitle","metaDescription","characteristics"}]} in the same order as the input.`;

/**
 * The feed's shortDescription is usually just the description cut at ~220
 * chars. Re-deriving it from the translated description avoids paying for
 * (and getting a mid-word cut of) the same text twice.
 */
function isTruncatedCopy(short: string | null, full: string | null): boolean {
  if (!short || !full) return false;
  return full.startsWith(short.trim().slice(0, Math.min(short.trim().length, 120)));
}

function truncateClean(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (sentenceEnd > max * 0.5) return cut.slice(0, sentenceEnd + 1);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : max).replace(/[\s,.;:–-]+$/, "")}…`;
}

async function translateBatch(products: SourceProduct[]): Promise<TranslatedProduct[]> {
  const input = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    shortDescription: isTruncatedCopy(p.shortDescription, p.description) ? null : p.shortDescription,
    description: p.description,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    characteristics: p.characteristics ?? null,
  }));

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        ...(IS_REASONING ? { reasoning_effort: "low" as const } : { temperature: 0.2 }),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({ products: input }) },
        ],
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("empty response");
      const parsed = JSON.parse(content) as { products?: TranslatedProduct[] };
      const out = parsed.products ?? [];
      const byId = new Map(out.map((p) => [p.id, p]));
      const missing = products.filter((p) => !byId.get(p.id)?.name);
      if (missing.length) throw new Error(`missing ${missing.length} products in response`);
      return products.map((p) => {
        const t = byId.get(p.id)!;
        if (isTruncatedCopy(p.shortDescription, p.description) && t.description) {
          t.shortDescription = truncateClean(t.description, Math.max(p.shortDescription!.length, 160));
        }
        return t;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === 4) throw err;
      const wait = 2000 * attempt * attempt;
      console.warn(`  batch retry ${attempt} in ${wait}ms: ${msg}`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error("unreachable");
}

async function save(t: TranslatedProduct) {
  const value = {
    name: t.name,
    shortDescription: t.shortDescription ?? null,
    description: t.description ?? null,
    metaTitle: t.metaTitle ?? null,
    metaDescription: t.metaDescription ?? null,
    characteristics: t.characteristics ?? null,
  };
  // Merge so other locales already stored on the row are preserved.
  await pool.query(
    `UPDATE "Product"
        SET translations = COALESCE(translations, '{}'::jsonb) || jsonb_build_object($2::text, $3::jsonb)
      WHERE id = $1`,
    [t.id, LOCALE, JSON.stringify(value)],
  );
}

async function main() {
  const { rows } = await pool.query<SourceProduct>(
    `SELECT id, name, "shortDescription", description, "metaTitle", "metaDescription", characteristics, brand
       FROM "Product"
      WHERE status <> 'ARCHIVED'
        ${force ? "" : `AND (translations IS NULL OR translations->'${LOCALE}' IS NULL)`}
      ORDER BY (status = 'ACTIVE') DESC, "createdAt" ASC
      ${limit ? `LIMIT ${Number(limit)}` : ""}`,
  );

  console.log(`Translating ${rows.length} products to ${LOCALE} with ${MODEL}…`);
  const batches: SourceProduct[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) batches.push(rows.slice(i, i + BATCH_SIZE));

  let done = 0;
  let failed = 0;
  let next = 0;
  const worker = async () => {
    while (next < batches.length) {
      const batch = batches[next++];
      try {
        const translated = await translateBatch(batch);
        for (const t of translated) await save(t);
        done += batch.length;
      } catch (err) {
        failed += batch.length;
        console.error(`  batch failed (${batch.map((b) => b.id).join(",")}):`, err instanceof Error ? err.message : err);
      }
      if ((done + failed) % 80 < BATCH_SIZE) console.log(`  ${done + failed}/${rows.length} (failed ${failed})`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`Done: ${done} translated, ${failed} failed. Re-run to retry failures.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
