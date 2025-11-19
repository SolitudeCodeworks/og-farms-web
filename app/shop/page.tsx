import { ProductCard } from "@/components/product/product-card"

// This will be replaced with actual database queries
const products = [
  {
    id: "1",
    name: "Granddaddy Purple",
    slug: "granddaddy-purple",
    price: 21,
    compareAtPrice: 25,
    image: "/products/placeholder-1.jpg",
    category: "FLOWER",
    thcContent: 23,
    stock: 10,
  },
  {
    id: "2",
    name: "Girl Scout Cookies",
    slug: "girl-scout-cookies",
    price: 14,
    compareAtPrice: 18,
    image: "/products/placeholder-2.jpg",
    category: "FLOWER",
    thcContent: 28,
    cbdContent: 1,
    stock: 15,
  },
  {
    id: "3",
    name: "Sour Diesel",
    slug: "sour-diesel",
    price: 11,
    image: "/products/placeholder-3.jpg",
    category: "FLOWER",
    thcContent: 22,
    stock: 8,
  },
  {
    id: "4",
    name: "Premium Glass Bong",
    slug: "premium-glass-bong",
    price: 89,
    compareAtPrice: 120,
    image: "/products/placeholder-4.jpg",
    category: "BONGS",
    stock: 5,
  },
  {
    id: "5",
    name: "Blue Dream",
    slug: "blue-dream",
    price: 18,
    image: "/products/placeholder-5.jpg",
    category: "FLOWER",
    thcContent: 21,
    cbdContent: 2,
    stock: 12,
  },
  {
    id: "6",
    name: "Metal Grinder",
    slug: "metal-grinder",
    price: 25,
    compareAtPrice: 35,
    image: "/products/placeholder-6.jpg",
    category: "GRINDERS",
    stock: 20,
  },
  {
    id: "7",
    name: "Rolling Papers Pack",
    slug: "rolling-papers-pack",
    price: 5,
    image: "/products/placeholder-7.jpg",
    category: "PAPERS",
    stock: 50,
  },
  {
    id: "8",
    name: "OG Kush",
    slug: "og-kush",
    price: 19,
    image: "/products/placeholder-8.jpg",
    category: "FLOWER",
    thcContent: 24,
    stock: 7,
  },
]

const categories = [
  { name: "All Products", value: "" },
  { name: "Flower", value: "FLOWER" },
  { name: "Accessories", value: "ACCESSORIES" },
  { name: "Bongs", value: "BONGS" },
  { name: "Grinders", value: "GRINDERS" },
  { name: "Papers", value: "PAPERS" },
]

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Shop</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our selection of premium cannabis products
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Empty State (if no products) */}
      {products.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-semibold text-foreground">
            No products found
          </h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your filters or check back later
          </p>
        </div>
      )}
    </div>
  )
}
