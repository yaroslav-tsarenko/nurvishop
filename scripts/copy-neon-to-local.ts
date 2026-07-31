import "dotenv/config";
import pg from "pg";

// One-off: copy all data from the (throttled) Neon DB into the local Postgres
// so the storefront works offline. Schema must already exist locally
// (`prisma db push --url <local>`).

const SOURCE = process.env.DIRECT_URL;
const TARGET = "postgresql://yaroslav@localhost:5432/nurvishop";
if (!SOURCE) throw new Error("DIRECT_URL (Neon) not set");

async function connect(connectionString: string, ssl: boolean) {
  const c = new pg.Client({ connectionString, ssl: ssl ? { rejectUnauthorized: false } : undefined });
  c.on("error", () => {});
  await c.connect();
  return c;
}

// Retry Neon reads: the compute-quota error (53000) can be transient.
async function readWithRetry(src: pg.Client, sql: string): Promise<pg.QueryResult> {
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      return await src.query(sql);
    } catch (err: any) {
      const quota = err.code === "53000" || /quota/i.test(err.message || "");
      const conn = /terminated|Connection|EPIPE/i.test(err.message || "");
      if ((quota || conn) && attempt < 8) {
        const wait = quota ? 8000 : 1500;
        process.stdout.write(`\n    retry ${attempt} (${quota ? "quota" : "conn"}), waiting ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  throw new Error("unreachable");
}

async function main() {
  const src = await connect(SOURCE!, true);
  const tgt = await connect(TARGET, false);

  // Tables in FK-safe dependency order (parents first). Triggers disabled anyway.
  const tables: string[] = (
    await tgt.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
      ORDER BY tablename
    `)
  ).rows.map((r: { tablename: string }) => r.tablename);

  await tgt.query("SET session_replication_role = replica"); // ignore FK order

  for (const table of tables) {
    const q = `"${table}"`;
    let rows: any[];
    try {
      rows = (await readWithRetry(src, `SELECT * FROM ${q}`)).rows;
    } catch (err: any) {
      console.log(`\n  ${table}: SKIP (source read failed: ${err.message})`);
      continue;
    }
    await tgt.query(`TRUNCATE ${q} CASCADE`);
    if (rows.length === 0) {
      console.log(`  ${table}: 0 rows`);
      continue;
    }

    const cols = Object.keys(rows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const BATCH = 500;
    let done = 0;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const values: unknown[] = [];
      const placeholders: string[] = [];
      batch.forEach((row, r) => {
        const ph = cols.map((_, c) => `$${r * cols.length + c + 1}`);
        placeholders.push(`(${ph.join(", ")})`);
        for (const col of cols) {
          let v = row[col];
          if (v && typeof v === "object" && !(v instanceof Date) && !Buffer.isBuffer(v)) {
            v = JSON.stringify(v); // json/jsonb columns
          }
          values.push(v);
        }
      });
      await tgt.query(
        `INSERT INTO ${q} (${colList}) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING`,
        values,
      );
      done += batch.length;
    }
    console.log(`  ${table}: ${done} rows`);
  }

  await tgt.query("SET session_replication_role = DEFAULT");
  await src.end();
  await tgt.end();
  console.log("\nCopy complete.");
}

main().catch((err) => {
  console.error("Copy failed:", err);
  process.exit(1);
});
