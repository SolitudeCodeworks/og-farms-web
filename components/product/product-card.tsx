import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image: string
  category: string
  thcContent?: number
  cbdContent?: number
  stock: number
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  category,
  thcContent,
  cbdContent,
  stock,
}: ProductCardProps) {
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/product/${slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {discount > 0 && (
            <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
              -{discount}%
            </div>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-lg font-bold text-white">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {category}
          </span>
          {(thcContent || cbdContent) && (
            <div className="flex gap-2 text-xs">
              {thcContent && (
                <span className="text-primary font-semibold">
                  THC {thcContent}%
                </span>
              )}
              {cbdContent && (
                <span className="text-primary font-semibold">
                  CBD {cbdContent}%
                </span>
              )}
            </div>
          )}
        </div>
        <Link href={`/product/${slug}`}>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(price)}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={stock === 0}
          onClick={(e) => {
            e.preventDefault()
            // Add to cart logic will be handled by the parent component
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
