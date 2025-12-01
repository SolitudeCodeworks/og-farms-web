import 'dotenv/config'
import { PrismaClient, Category } from '@prisma/client'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🌿 Seeding accessories...')

  // Get a store for inventory
  const store = await prisma.store.findFirst()
  
  if (!store) {
    console.error('❌ No store found. Please create a store first.')
    return
  }

  const accessories = [
    {
      name: "Premium Rolling Papers - King Size",
      slug: "premium-rolling-papers-king-size",
      description: "Ultra-thin, slow-burning rolling papers made from natural rice paper. King size for the perfect roll every time. 32 leaves per pack.",
      price: 25.00,
      category: Category.ACCESSORIES,
      subcategory: "Rolling Papers",
      images: ["/images/products/rolling-papers.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 150
    },
    {
      name: "Glass Bong - 30cm Beaker Base",
      slug: "glass-bong-30cm-beaker",
      description: "High-quality borosilicate glass bong with beaker base for stability. Features ice catcher and removable downstem. Easy to clean and durable.",
      price: 450.00,
      category: Category.ACCESSORIES,
      subcategory: "Bongs",
      images: ["/images/products/glass-bong.jpg"],
      featured: true,
      ageRestricted: false,
      stock: 25
    },
    {
      name: "Herb Grinder - 4 Piece Aluminum",
      slug: "herb-grinder-4-piece-aluminum",
      description: "Premium 4-piece aluminum grinder with diamond-shaped teeth for perfect consistency. Includes pollen catcher and scraper. 63mm diameter.",
      price: 180.00,
      category: Category.ACCESSORIES,
      subcategory: "Grinders",
      images: ["/images/products/grinder.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 80
    },
    {
      name: "Silicone Bong - Unbreakable Travel",
      slug: "silicone-bong-unbreakable",
      description: "Flexible, unbreakable silicone bong perfect for travel. Dishwasher safe and comes with glass bowl. Folds flat for easy storage.",
      price: 320.00,
      category: Category.ACCESSORIES,
      subcategory: "Bongs",
      images: ["/images/products/silicone-bong.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 40
    },
    {
      name: "Rolling Tray - Metal with Magnetic Lid",
      slug: "rolling-tray-metal-magnetic",
      description: "Large metal rolling tray with magnetic lid to keep everything secure. Non-stick surface and rounded edges. 30cm x 20cm.",
      price: 150.00,
      category: Category.ACCESSORIES,
      subcategory: "Rolling Trays",
      images: ["/images/products/rolling-tray.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 60
    },
    {
      name: "Glass Pipe - Spoon Style",
      slug: "glass-pipe-spoon-style",
      description: "Hand-blown glass spoon pipe with unique color patterns. Deep bowl and carb hole. Compact and portable. Each piece is unique.",
      price: 120.00,
      category: Category.ACCESSORIES,
      subcategory: "Pipes",
      images: ["/images/products/glass-pipe.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 70
    },
    {
      name: "Pre-Rolled Cones - 100 Pack",
      slug: "pre-rolled-cones-100-pack",
      description: "Premium pre-rolled cones made from natural unbleached paper. King size with filter tips included. Perfect for quick and easy rolling.",
      price: 95.00,
      category: Category.ACCESSORIES,
      subcategory: "Rolling Papers",
      images: ["/images/products/pre-rolled-cones.jpg"],
      featured: true,
      ageRestricted: false,
      stock: 200
    },
    {
      name: "Smell-Proof Storage Jar - 250ml",
      slug: "smell-proof-storage-jar-250ml",
      description: "UV-protected glass jar with airtight seal to preserve freshness. Keeps odors contained. Perfect for storing herbs. 250ml capacity.",
      price: 85.00,
      category: Category.ACCESSORIES,
      subcategory: "Storage",
      images: ["/images/products/storage-jar.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 90
    },
    {
      name: "Electric Herb Grinder - USB Rechargeable",
      slug: "electric-herb-grinder-usb",
      description: "Automatic electric grinder with USB charging. One-button operation for perfect consistency every time. LED indicator and safety lock.",
      price: 380.00,
      category: Category.ACCESSORIES,
      subcategory: "Grinders",
      images: ["/images/products/electric-grinder.jpg"],
      featured: true,
      ageRestricted: false,
      stock: 35
    },
    {
      name: "Lighter - Refillable Torch",
      slug: "lighter-refillable-torch",
      description: "High-quality refillable torch lighter with adjustable flame. Wind-resistant and reliable. Safety lock included. Butane refillable.",
      price: 65.00,
      category: Category.ACCESSORIES,
      subcategory: "Lighters",
      images: ["/images/products/torch-lighter.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 120
    },
    {
      name: "Cleaning Kit - Complete Bong Care",
      slug: "cleaning-kit-complete",
      description: "Complete cleaning kit with brushes, cleaning solution, and pipe cleaners. Everything you need to keep your pieces sparkling clean.",
      price: 140.00,
      category: Category.ACCESSORIES,
      subcategory: "Cleaning",
      images: ["/images/products/cleaning-kit.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 55
    },
    {
      name: "Rolling Machine - Automatic 110mm",
      slug: "rolling-machine-automatic-110mm",
      description: "Automatic rolling machine for perfect joints every time. Adjustable thickness and works with king size papers. Durable plastic construction.",
      price: 75.00,
      category: Category.ACCESSORIES,
      subcategory: "Rolling Papers",
      images: ["/images/products/rolling-machine.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 100
    },
    {
      name: "Ash Tray - Deep Ceramic",
      slug: "ash-tray-deep-ceramic",
      description: "Large deep ceramic ashtray with multiple rests. Easy to clean and heat resistant. Modern design fits any space. 15cm diameter.",
      price: 55.00,
      category: Category.ACCESSORIES,
      subcategory: "Ash Trays",
      images: ["/images/products/ash-tray.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 75
    },
    {
      name: "Dab Tool Set - Stainless Steel 5pc",
      slug: "dab-tool-set-stainless-5pc",
      description: "Professional 5-piece stainless steel dab tool set. Includes various tips for different concentrates. Non-stick and easy to clean.",
      price: 110.00,
      category: Category.ACCESSORIES,
      subcategory: "Dab Tools",
      images: ["/images/products/dab-tools.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 45
    },
    {
      name: "Smell-Proof Bag - Lockable Travel Case",
      slug: "smell-proof-bag-lockable",
      description: "Discreet smell-proof travel bag with combination lock. Multiple compartments for organization. Water-resistant exterior. Perfect for on-the-go.",
      price: 220.00,
      category: Category.ACCESSORIES,
      subcategory: "Storage",
      images: ["/images/products/smell-proof-bag.jpg"],
      featured: false,
      ageRestricted: false,
      stock: 50
    }
  ]

  for (const accessory of accessories) {
    const { stock, ...productData } = accessory
    
    // Create product
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: productData,
      create: productData
    })

    // Create inventory
    await prisma.storeInventory.upsert({
      where: {
        storeId_productId: {
          storeId: store.id,
          productId: product.id
        }
      },
      update: {
        quantity: stock
      },
      create: {
        storeId: store.id,
        productId: product.id,
        quantity: stock
      }
    })

    console.log(`✅ Created: ${product.name} (Stock: ${stock})`)
  }

  console.log('🎉 Accessories seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding accessories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
