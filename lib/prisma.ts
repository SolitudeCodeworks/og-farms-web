import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

let prismaInstance: PrismaClient

if (connectionString) {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prismaInstance = new PrismaClient({ adapter })
} else {
  // Fallback for build time when DATABASE_URL might not be available
  prismaInstance = new PrismaClient()
}

export const prisma = global.prisma ?? prismaInstance

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
