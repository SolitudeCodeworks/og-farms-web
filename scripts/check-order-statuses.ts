import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orders = await prisma.$queryRaw`
    SELECT status, COUNT(*) as count 
    FROM "Order" 
    GROUP BY status
  `
  
  console.log('Current order statuses in database:')
  console.log(orders)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
