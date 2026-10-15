/**
 * Second-pass proofreading of machine-translated product names
 * (Product.translations.<locale>.name). A stronger model sees the English
 * original next to the current translation and only rewrites names that are
 * wrong, unnatural or ungrammatical.
 *
 *   npx tsx scripts/review-product-names.ts            # all products
 *   npx tsx scripts/review-product-names.ts --limit 40 # try a few first
 */
import "dotenv/config";
import pg from "pg";
import OpenAI from "openai";

const LOCALE = "lv";
const BATCH_SIZE = 40;
const CONCURRENCY = 5;
const MODEL = process.env.REVIEW_MODEL || "gpt-5.5";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL not set");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : undefined;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new pg.Pool({ connectionString, max: CONCURRENCY + 1 });

const SYSTEM_PROMPT = `You are a native Latvian e-commerce copy editor for nurvishop, a home & lifestyle web shop.
You get product names: the English supplier name and its current Latvian translation.
Fix the Latvian name when it is wrong, a word-by-word calque, ungrammatical, or misunderstands what the product is (supplier names are often garbled: "Moulded frame Junior Knows Plaster Children's" is a children's plaster moulding kit → "Bērnu ģipša liešanas komplekts Junior Knows").

Style: short shop-style name; the product noun first (with genitive/adjective modifiers before it), then brand/model, then attributes after commas (colour as an agreeing adjective, materials as nouns joined with "/", sizes). Lowercase except the first word, brands and model codes. Keep brands, model codes, numbers and units exactly. "(N Units)" → "(N gab.)".
Correct Latvian grammar, agreement and diacritics (ā č ē ģ ī ķ ļ ņ š ū ž).
Be conservative: change a name only when it is clearly wrong or clearly unnatural. When unsure, or when the difference is just a synonym, return the current translation unchanged. Never guess a different product type than the English says ("Table Mat" = galda paliktnis, "Ladle" = kauss, "Perfume" for appliances = smaržviela/aromatizētājs veļai).

Respond with JSON {"items":[{"id","name"}]} containing every input id.`;

interface Row {
  id: string;
  en: string;
  lv: string;
}

async function reviewBatch(rows: Row[]): Promise<Map<string, string>> {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await openai.chat.completions.create({
        model: MODEL,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({ items: rows }) },
        ],
      });
      const parsed = JSON.parse(res.choices[0]?.message?.content || "{}") as {
        items?: { id: string; name: string }[];
      };
      const out = new Map((parsed.items ?? []).filter((i) => i.name?.trim()).map((i) => [i.id, i.name.trim()]));
      if (rows.some((r) => !out.has(r.id))) throw new Error("response is missing items");
      return out;
    } catch (err) {
      if (attempt === 4) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt * attempt));
    }
  }
  throw new Error("unreachable");
}

async function main() {
  const { rows } = await pool.query<Row>(
    `SELECT id, name AS en, translations->'${LOCALE}'->>'name' AS lv
       FROM "Product"
      WHERE translations->'${LOCALE}'->>'name' IS NOT NULL
      ORDER BY (status = 'ACTIVE') DESC, "createdAt" ASC
      ${limit ? `LIMIT ${Number(limit)}` : ""}`,
  );
  console.log(`Reviewing ${rows.length} ${LOCALE} names with ${MODEL}…`);

  const batches: Row[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) batches.push(rows.slice(i, i + BATCH_SIZE));

  let next = 0;
  let changed = 0;
  let failed = 0;
  const samples: string[] = [];
  const worker = async () => {
    while (next < batches.length) {
      const batch = batches[next++];
      try {
        const fixed = await reviewBatch(batch);
        for (const row of batch) {
          const name = fixed.get(row.id)!;
          if (name === row.lv) continue;
          changed++;
          if (samples.length < 40) samples.push(`${row.en}\n    ${row.lv}\n  → ${name}`);
          await pool.query(
            `UPDATE "Product"
                SET translations = jsonb_set(translations, ARRAY[$2::text, 'name'], to_jsonb($3::text))
              WHERE id = $1`,
            [row.id, LOCALE, name],
          );
        }
      } catch (err) {
        failed += batch.length;
        console.error("  batch failed:", err instanceof Error ? err.message : err);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(samples.join("\n"));
  console.log(`Done: ${changed} names changed, ${failed} failed.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
