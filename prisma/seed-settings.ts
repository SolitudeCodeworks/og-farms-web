import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSettings() {
  console.log('Seeding site settings...')

  const settings = [
    {
      key: 'social_facebook',
      value: 'https://www.facebook.com/share/17wy7dDgqt/',
      category: 'social',
      description: 'Facebook page URL'
    },
    {
      key: 'social_instagram',
      value: 'https://www.instagram.com/ogfarms2025?utm_source=qr&igsh=MWw1MDlpb2Q4enN0ZA==',
      category: 'social',
      description: 'Instagram profile URL'
    },
    {
      key: 'contact_phone',
      value: '073 963 8575',
      category: 'contact',
      description: 'Main contact phone number'
    }
  ]

  for (const setting of settings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting
    })
    console.log(`✓ Seeded: ${setting.key}`)
  }

  console.log('Settings seeded successfully!')
}

seedSettings()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
