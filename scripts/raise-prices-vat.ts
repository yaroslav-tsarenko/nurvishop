import "dotenv/config";
import pg from "pg";

/**
 * One-time price adjustment for the VAT-inclusive pricing switch.
 *
 * Product prices used to be treated as VAT-exclusive (21% was added in the cart).
 * Now prices DISPLAY as VAT-inclusive, so relabelling the same numbers would silently
 * eat the 21% margin. This script raises each price to preserve the intended net:
 *
 *   - Product HAS a markup (price > costPrice, or costPrice is null): raise by 21%.
 *   - Product has NO markup (price <= costPrice): raise by 40% to restore a healthy margin.
 *
 * comparePrice (the struck-through "was" price) is raised by the same factor so discounts stay consistent.
 *
 * SAFETY: dry-run by default. Prints exactly what WOULD change and touches nothing.
 * Pass `--apply` to actually write. Confirm the DIRECT_URL target before applying to prod.
 */

const VAT_FACTOR = 1.21;
const NO_MARKUP_FACTOR = 1.4;

const APPLY = process.argv.includes("--apply");

const connectionString: string = process.env.DIRECT_URL ?? "";
if (!connectionString) throw new Error("DIRECT_URL not set in .env");

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log(
    APPLY
      ? "APPLYING price raise (writing to database)...\n"
      : "DRY RUN — no changes will be written. Re-run with --apply to commit.\n",
  );
  console.log(`Target DB host: ${new URL(connectionString.replace(/^postgres(ql)?:\/\//, "https://")).host}\n`);

  const { rows } = await client.query<{
    id: string;
    sku: string;
    name: string;
    price: string;
    comparePrice: string | null;
    costPrice: string | null;
  }>(`SELECT id, sku, name, price, "comparePrice", "costPrice" FROM "Product" ORDER BY name`);

  let raised21 = 0;
  let raised40 = 0;
  let skipped = 0;

  for (const p of rows) {
    const price = Number(p.price);
    if (!price || price <= 0) {
      skipped++;
      continue;
    }
    const cost = p.costPrice != null ? Number(p.costPrice) : null;
    const hasMarkup = cost == null || price > cost;
    const factor = hasMarkup ? VAT_FACTOR : NO_MARKUP_FACTOR;

    const newPrice = round2(price * factor);
    const compare = p.comparePrice != null ? Number(p.comparePrice) : null;
    const newCompare = compare != null && compare > 0 ? round2(compare * factor) : null;

    if (hasMarkup) raised21++;
    else raised40++;

    const tag = hasMarkup ? "+21%" : "+40%";
    console.log(
      `  ${tag} ${p.name} (${p.sku}): €${price.toFixed(2)} → €${newPrice.toFixed(2)}` +
        (newCompare != null ? `  [compare €${compare!.toFixed(2)} → €${newCompare.toFixed(2)}]` : ""),
    );

    if (APPLY) {
      await client.query(
        `UPDATE "Product" SET price = $1, "comparePrice" = $2, "updatedAt" = NOW() WHERE id = $3`,
        [newPrice, newCompare, p.id],
      );
    }
  }

  console.log(
    `\n${APPLY ? "Applied" : "Would apply"}: ${raised21} at +21%, ${raised40} at +40%. Skipped (zero/invalid price): ${skipped}.`,
  );
  if (!APPLY) console.log("\nNothing was written. Re-run with `npx tsx scripts/raise-prices-vat.ts --apply` to commit.");

  await client.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
