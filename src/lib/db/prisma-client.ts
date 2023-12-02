import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaBase = globalForPrisma.prisma ?? new PrismaClient();

// Prisma Client Extension
// This way for each update query on cart model we add updatedAt: new Date()
// Add a Cron-Job in Vercel to delete periodically carts without user and not recently updated
export const prisma = prismaBase.$extends({
  query: {
    cart: {
      async update({ args, query }) {
        args.data = { ...args.data, updatedAt: new Date() }
        return query(args);
      }
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaBase;