import { config } from 'dotenv'
config()

import { prisma } from '../lib/prisma'

const defaultImage = 'https://axtbqjb4q3jid2po.public.blob.vercel-storage.com/istockphoto-2173059563-612x612.jpg'
const basePrice = 200

async function main() {
  console.log('Starting product seed...')

  // PRE-ROLLS
  const preRollsIndoor = [
    'Block Berry',
    'Gelato',
    'Jungle Diamond',
    'East Sour Diesel',
    'Swiss Cheese',
    'Gilly Biscotti',
    'Cherry Gelato',
    'Strawberry Runtz'
  ]

  const preRollsGreenhouse = [
    "Zack's Cake",
    'Orange Kush Cakes',
    'Big Force Pops',
    'OG Berry',
    'Berry Crescendo Pops',
    'Golden Cheese',
    'OG Lemon',
    'Budget Baller',
    'Big Budha Cheese',
    'Tigers Blood',
    'Sugar Cake',
    'Purple Queen',
    'Cherry Gelato',
    'Cheese',
    'Kopano Kush',
    'Primo',
    'OG LA Kush',
    'Passion Punch',
    'Berry Snaps',
    'Mac One'
  ]

  const preRollsOutdoor = [
    'Sazwi Gym',
    'Tropicana Cookies'
  ]

  // EDIBLES - Cookies
  const ediblesCookies = [
    { name: 'Canalicious Cookies 20mg Pack of 3', thc: '20mg' },
    { name: 'Canalicious Cookies 20mg Pack of 5', thc: '20mg' },
    { name: 'Canalicious Cookies 100mg Choc Chip', thc: '100mg' },
    { name: 'Canalicious Cookies 100mg Spicy Pecan Nuts', thc: '100mg' },
    { name: 'Canalicious Cookies 200mg Choc Chip', thc: '200mg' },
    { name: 'Canalicious Cookies 200mg Spicy Pecan', thc: '200mg' },
    { name: 'Canalicious Cookies 200mg Coconut Oat', thc: '200mg' }
  ]

  // EDIBLES - Gummies
  const ediblesGummies = [
    { name: 'Canalicious Gummies Pack 3 20mg', thc: '20mg' },
    { name: 'Canalicious Gummies Pack 5 20mg', thc: '20mg' },
    { name: 'Yummy Gummies 100mg', thc: '100mg' },
    { name: 'Yummy Gummies 200mg Sugar Free', thc: '200mg' },
    { name: 'Yummy Gummies 200mg', thc: '200mg' }
  ]

  // EDIBLES - Oils
  const ediblesOils = [
    'Canalicious Cannabis Oil Energy',
    'Canalicious Cannabis Oil Relax',
    'Canalicious Cannabis Oil Pain'
  ]

  // FLOWER - Medical
  const flowerMedical = [
    'Tutti Fruity',
    'Mexican Wedding',
    'Apple Sour',
    'Critical Haze',
    'Godfather OG',
    'Sour Chem',
    'Bakers Delight',
    'Mawi Wawi',
    'OMG',
    'Primo',
    'LA Kush',
    'Runtz Muffin',
    'Passion Punch',
    'Astro Snaps',
    'MAC 1'
  ]

  // FLOWER - Indoor
  const flowerIndoor = [
    'Block Berry',
    'Jungle Diamond',
    'East Sour Diesel',
    'Gilly Biscotti',
    'Strawberry Runtz',
    'Super S Haze',
    'Purple Haze',
    'Fusion',
    'Gelato',
    'Passion Punch',
    'Tunnel',
    'Jungle Pie',
    'Purple Thai',
    'Sky Walker',
    'Snoop Dog'
  ]

  // FLOWER - Greenhouse
  const flowerGreenhouse = [
    'Cheese',
    'Orange Kali',
    'Berry Crescendo',
    'Cherry Gelato'
  ]

  // FLOWER - Outdoor
  const flowerOutdoor = [
    'Sazwi Gym',
    'Tropicana Cookies'
  ]

  // Helper function to create slug
  function createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Create Pre-Rolls Indoor
  console.log('Creating Indoor Pre-Rolls...')
  for (const name of preRollsIndoor) {
    await prisma.product.upsert({
      where: { slug: createSlug(name) },
      update: {},
      create: {
        name,
        slug: createSlug(name),
        description: `Premium ${name} pre-rolled joint. Indoor grown for superior quality and potency.`,
        price: basePrice,
        category: 'PRE_ROLLS',
        subcategory: 'Indoor',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: '15-20',
        cbdContent: '0-2'
      }
    })
  }

  // Create Pre-Rolls Greenhouse
  console.log('Creating Greenhouse Pre-Rolls...')
  for (const name of preRollsGreenhouse) {
    await prisma.product.upsert({
      where: { slug: createSlug(name) },
      update: {},
      create: {
        name,
        slug: createSlug(name),
        description: `Premium ${name} pre-rolled joint. Greenhouse grown for excellent quality.`,
        price: basePrice,
        category: 'PRE_ROLLS',
        subcategory: 'Greenhouse',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: '12-18',
        cbdContent: '0-2'
      }
    })
  }

  // Create Pre-Rolls Outdoor
  console.log('Creating Outdoor Pre-Rolls...')
  for (const name of preRollsOutdoor) {
    await prisma.product.upsert({
      where: { slug: createSlug(name) },
      update: {},
      create: {
        name,
        slug: createSlug(name),
        description: `Premium ${name} pre-rolled joint. Outdoor grown naturally.`,
        price: basePrice,
        category: 'PRE_ROLLS',
        subcategory: 'Outdoor',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: '10-15',
        cbdContent: '0-2'
      }
    })
  }

  // Create Edibles - Cookies
  console.log('Creating Edible Cookies...')
  for (const cookie of ediblesCookies) {
    await prisma.product.upsert({
      where: { slug: createSlug(cookie.name) },
      update: {},
      create: {
        name: cookie.name,
        slug: createSlug(cookie.name),
        description: `Delicious cannabis-infused cookies. ${cookie.thc} THC per serving.`,
        price: basePrice,
        category: 'EDIBLES',
        subcategory: 'Cookies',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: cookie.thc
      }
    })
  }

  // Create Edibles - Gummies
  console.log('Creating Edible Gummies...')
  for (const gummy of ediblesGummies) {
    await prisma.product.upsert({
      where: { slug: createSlug(gummy.name) },
      update: {},
      create: {
        name: gummy.name,
        slug: createSlug(gummy.name),
        description: `Premium cannabis-infused gummies. ${gummy.thc} THC per serving.`,
        price: basePrice,
        category: 'EDIBLES',
        subcategory: 'Gummies',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: gummy.thc
      }
    })
  }

  // Create Edibles - Oils
  console.log('Creating Cannabis Oils...')
  for (const oil of ediblesOils) {
    await prisma.product.upsert({
      where: { slug: createSlug(oil) },
      update: {},
      create: {
        name: oil,
        slug: createSlug(oil),
        description: `Premium cannabis oil. Perfect for wellness and therapeutic use.`,
        price: basePrice,
        category: 'EDIBLES',
        subcategory: 'Oils',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: 'Varies'
      }
    })
  }

  // Create Flower - Medical
  console.log('Creating Medical Flower...')
  for (const name of flowerMedical) {
    await prisma.product.upsert({
      where: { slug: createSlug(name) },
      update: {},
      create: {
        name,
        slug: createSlug(name),
        description: `Premium medical-grade ${name} cannabis flower. Carefully cultivated for therapeutic benefits.`,
        price: basePrice,
        category: 'FLOWER',
        subcategory: 'Medical',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: '18-25',
        cbdContent: '0-5',
        strain: 'Hybrid'
      }
    })
  }

  // Create Flower - Indoor
  console.log('Creating Indoor Flower...')
  for (const name of flowerIndoor) {
    await prisma.product.upsert({
      where: { slug: createSlug(name) + '-indoor' },
      update: {},
      create: {
        name: name,
        slug: createSlug(name) + '-indoor',
        description: `Premium ${name} cannabis flower. Indoor grown for maximum potency and quality.`,
        price: basePrice,
        category: 'FLOWER',
        subcategory: 'Indoor',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: '20-28',
        cbdContent: '0-2',
        strain: name
      }
    })
  }

  // Create Flower - Greenhouse
  console.log('Creating Greenhouse Flower...')
  for (const name of flowerGreenhouse) {
    await prisma.product.upsert({
      where: { slug: createSlug(name) + '-greenhouse' },
      update: {},
      create: {
        name: name,
        slug: createSlug(name) + '-greenhouse',
        description: `Premium ${name} cannabis flower. Greenhouse grown for excellent quality and consistency.`,
        price: basePrice,
        category: 'FLOWER',
        subcategory: 'Greenhouse',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: '15-22',
        cbdContent: '0-3',
        strain: name
      }
    })
  }

  // Create Flower - Outdoor
  console.log('Creating Outdoor Flower...')
  for (const name of flowerOutdoor) {
    await prisma.product.upsert({
      where: { slug: createSlug(name) + '-outdoor' },
      update: {},
      create: {
        name: name,
        slug: createSlug(name) + '-outdoor',
        description: `Premium ${name} cannabis flower. Naturally grown outdoors under the sun.`,
        price: basePrice,
        category: 'FLOWER',
        subcategory: 'Outdoor',
        images: [defaultImage],
        featured: false,
        ageRestricted: true,
        thcContent: '12-18',
        cbdContent: '0-3',
        strain: name
      }
    })
  }

  console.log('Product seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
