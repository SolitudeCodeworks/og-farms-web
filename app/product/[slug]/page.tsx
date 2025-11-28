import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/product/product-card"
import { getProductBySlug, getFrequentlyBoughtTogether } from "@/lib/actions/products"
import { formatPrice } from "@/lib/utils"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { ReviewSection } from "@/components/product/review-section"

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const { product } = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const { products: frequentlyBought } = await getFrequentlyBoughtTogether(product.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Product Details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.images[0] || "/products/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1, 5).map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-primary uppercase">
              {product.category}
            </p>
            <h1 className="mt-2 text-4xl font-bold text-foreground">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          {product.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.averageRating || 0)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.averageRating?.toFixed(1)} ({product.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                  Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* THC/CBD Content */}
          {(product.thcContent || product.cbdContent) && (
            <div className="flex gap-4">
              {product.thcContent && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">THC Content</p>
                  <p className="text-2xl font-bold text-primary">
                    {product.thcContent}%
                  </p>
                </div>
              )}
              {product.cbdContent && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">CBD Content</p>
                  <p className="text-2xl font-bold text-primary">
                    {product.cbdContent}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Description
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              image={product.images[0] || "/products/placeholder.jpg"}
              category={product.category}
              className="flex-1"
            />
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Bought Together
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {frequentlyBought.map((item: any) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                slug={item.slug}
                price={item.price}
                compareAtPrice={item.compareAtPrice || undefined}
                image={item.images[0] || "/products/placeholder.jpg"}
                category={item.category}
                stock={item.stock}
              />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <ReviewSection productId={product.id} reviews={product.reviews} />
    </div>
  )
}
