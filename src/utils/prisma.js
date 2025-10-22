import { PrismaClient } from "../generated/prisma/index.js";
// Initialize Prisma Client with options for production
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
});
