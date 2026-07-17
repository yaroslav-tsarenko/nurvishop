import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function withExplicitSslMode(url: string): string {
  // pg-connection-string v3 / pg v9 will change the meaning of the legacy
  // 'prefer' | 'require' | 'verify-ca' aliases. Normalise them to the libpq
  // semantics we actually want so the deprecation warning is silenced and the
  // behaviour stays stable across the upgrade.
  if (!/[?&]sslmode=/.test(url)) return url;
  return url.replace(
    /([?&])sslmode=(prefer|require|verify-ca)(?=&|$)/,
    (_match, sep) => `${sep}uselibpqcompat=true&sslmode=require`
  );
}

const connectionString = withExplicitSslMode(
  process.env.DIRECT_URL ||
    "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"
);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
