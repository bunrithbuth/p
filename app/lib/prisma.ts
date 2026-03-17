import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveDatasourceUrl() {
  const fallback = "postgresql://postgres:postgres@postgres:5432/dashboard";
  const rawUrl =
    process.env.PRISMA_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    fallback;

  try {
    const parsed = new URL(rawUrl);
    const isDocker = process.env.RUNNING_IN_DOCKER === "true";

    // In Docker, localhost/127.0.0.1 points to the app container itself.
    if (isDocker && (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost")) {
      parsed.hostname = "postgres";
    }

    return parsed.toString();
  } catch {
    return fallback;
  }
}

const datasourceUrl = resolveDatasourceUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: datasourceUrl }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
