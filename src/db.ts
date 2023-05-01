import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// This should not be necessary, but Cypress is not loading the .env file
// in CI for some reason.
config();

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
