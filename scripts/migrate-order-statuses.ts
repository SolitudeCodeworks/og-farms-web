import { prisma } from '../lib/prisma'

async function main() {
  console.log('Starting order status migration...')

  // Map old statuses to new statuses
  const statusMappings = {
    SHIPPED: 'OUT_FOR_DELIVERY',
    DELIVERED: 'COMPLETED',
    READY_FOR_PICKUP: 'PROCESSING',
  }

  for (const [oldStatus, newStatus] of Object.entries(statusMappings)) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "Order" SET status = '${newStatus}' WHERE status = '${oldStatus}'`
    )
    console.log(`Updated ${result} orders from ${oldStatus} to ${newStatus}`)
  }

  console.log('Migration complete!')
}

main()
  .catch((e) => {
    console.error('Error during migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
