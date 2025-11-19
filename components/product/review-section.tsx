"use client"

import { useState } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createReview, markReviewHelpful } from "@/lib/actions/reviews"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Review {
  id: string
  rating: number
  title?: string | null
  comment: string
  verified: boolean
  helpful: number
  createdAt: Date
  user: {
    name: string | null
  }
}

interface ReviewSectionProps {
  productId: string
  reviews: Review[]
}

export function ReviewSection({ productId, reviews }: ReviewSectionProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await createReview({
        productId,
        rating,
        title: title || undefined,
        comment,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setShowForm(false)
        setRating(5)
        setTitle("")
        setComment("")
        router.refresh()
      }
    } catch (err) {
      setError("Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkHelpful = async (reviewId: string) => {
    await markReviewHelpful(reviewId)
    router.refresh()
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Customer Reviews ({reviews.length})
        </h2>
        {session?.user && !showForm && (
          <Button onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="title" className="text-sm font-medium mb-2 block">
                  Title (optional)
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum up your experience"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                  Review
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product"
                  required
                  disabled={loading}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {review.user.name || "Anonymous"}
                      </span>
                      {review.verified && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h3 className="font-semibold text-foreground mb-2">
                    {review.title}
                  </h3>
                )}
                
                <p className="text-muted-foreground mb-4">{review.comment}</p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}
