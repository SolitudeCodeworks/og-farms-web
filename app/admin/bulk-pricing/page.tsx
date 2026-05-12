'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Search, Package, X, ChevronRight, CircleHelp } from 'lucide-react'
import { SUBCATEGORIES } from '@/lib/product-constants'

type BulkPricingRule = {
  id: string
  productId: string
  rangeKey: string | null
  minQuantity: number
  maxQuantity: number | null
  tierPrice: number
  product: {
    id: string
    name: string
    slug: string
    category: string
    subcategory: string | null
    price: number
  }
}

type EditFormState = {
  minQuantity: string
  maxQuantity: string
  tierPrice: string
}

type ProductSearchResult = {
  id: string
  name: string
  slug: string
  category: string
  subcategory: string | null
  price: number
}

const DEFAULT_EDIT_FORM: EditFormState = {
  minQuantity: '',
  maxQuantity: '',
  tierPrice: '',
}

export default function BulkPricingAdminPage() {
  const router = useRouter()
  const [rules, setRules] = useState<BulkPricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState('')
  const [editingRule, setEditingRule] = useState<BulkPricingRule | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>(DEFAULT_EDIT_FORM)
  const [configureOpen, setConfigureOpen] = useState(false)
  const [configureMode, setConfigureMode] = useState<'product' | 'subcategory'>('product')
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState<ProductSearchResult[]>([])
  const [productSearching, setProductSearching] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  useEffect(() => {
    loadRules()
  }, [])

  useEffect(() => {
    if (editingRule) {
      setEditForm({
        minQuantity: editingRule.minQuantity.toString(),
        maxQuantity: editingRule.maxQuantity?.toString() || '',
        tierPrice: editingRule.tierPrice.toString(),
      })
    } else {
      setEditForm(DEFAULT_EDIT_FORM)
    }
  }, [editingRule])

  useEffect(() => {
    const trimmed = productSearch.trim()

    if (!configureOpen || configureMode !== 'product') {
      setProductResults([])
      return
    }

    if (trimmed.length < 2) {
      setProductResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setProductSearching(true)
        const params = new URLSearchParams()
        params.set('limit', '24')
        if (trimmed.length >= 2) {
          params.set('search', trimmed)
        }

        const response = await fetch(`/api/admin/products?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setProductResults((data.products || []).filter((product: ProductSearchResult) => {
            return product.category === 'FLOWER' || product.category === 'PRE_ROLLS'
          }))
        } else {
          setProductResults([])
        }
      } catch (error) {
        console.error('Error searching products:', error)
        setProductResults([])
      } finally {
        setProductSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [productSearch, configureOpen, configureMode])

  const loadRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/bulk-pricing')
      if (response.ok) {
        const data = await response.json()
        setRules(data.rules || [])
      } else {
        const data = await response.json().catch(() => ({}))
        setMessage(data.error || 'Failed to load bulk pricing rules')
      }
    } catch (error) {
      console.error('Error loading bulk pricing rules:', error)
      setMessage('Failed to load bulk pricing rules')
    } finally {
      setLoading(false)
    }
  }

  const filteredRules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return rules

    return rules.filter((rule) => {
      return [
        rule.product.name,
        rule.product.category,
        rule.product.subcategory || '',
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [rules, searchQuery])

  const openEdit = (rule: BulkPricingRule) => {
    setMessage('')
    setEditingRule(rule)
  }

  const saveEdit = async () => {
    if (!editingRule) return

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/bulk-pricing/${editingRule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minQuantity: editForm.minQuantity,
          maxQuantity: editForm.maxQuantity,
          tierPrice: editForm.tierPrice,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || 'Failed to update bulk pricing rule')
        return
      }

      setMessage('Bulk pricing rule updated successfully')
      setEditingRule(null)
      await loadRules()
    } catch (error) {
      console.error('Error saving bulk pricing rule:', error)
      setMessage('Failed to update bulk pricing rule')
    } finally {
      setSaving(false)
    }
  }

  const deleteRule = async (ruleId: string) => {
    const confirmed = window.confirm('Delete this bulk pricing deal? This will deactivate it.')
    if (!confirmed) return

    setDeletingId(ruleId)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/bulk-pricing/${ruleId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || 'Failed to delete bulk pricing rule')
        return
      }

      setMessage('Bulk pricing rule deleted successfully')
      await loadRules()
    } catch (error) {
      console.error('Error deleting bulk pricing rule:', error)
      setMessage('Failed to delete bulk pricing rule')
    } finally {
      setDeletingId(null)
    }
  }

  const openProductBulkPricing = (productId: string) => {
    setConfigureOpen(false)
    router.push(`/admin/products/${productId}/bulk-pricing`)
  }

  const openSubcategorySetup = (subcategory: string) => {
    setConfigureOpen(false)
    router.push(`/admin/bulk-pricing/subcategory/${encodeURIComponent(subcategory)}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bulk Pricing Deals</h1>
          <p className="text-gray-400">See, edit, or deactivate bulk discount tiers</p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setConfigureOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-white transition-colors hover:bg-primary/90"
        >
          Configure Bulk Pricing
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-500">
          Search a product for one-off setup, or choose a subcategory for category-wide deals.
        </span>
        <button
          onClick={() => setShowHowItWorks(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          <CircleHelp className="h-4 w-4" />
          How this works
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Configured Deals</h2>
            <p className="text-sm text-gray-400">Showing product-level bulk discounts</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, category, subcategory..."
              className="w-full pl-9 pr-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading bulk pricing deals...</div>
        ) : filteredRules.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <p>No bulk pricing deals configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-sm text-gray-400">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Qty Range</th>
                  <th className="pb-3 font-medium">Tier Price</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-zinc-800/60">
                    <td className="py-4 pr-4">
                      <div>
                        <div className="font-semibold text-white">{rule.product.name}</div>
                        <div className="text-sm text-gray-400">Base R{rule.product.price.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-300">
                      {rule.product.category}
                      {rule.product.subcategory ? ` / ${rule.product.subcategory}` : ''}
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-300">
                      {rule.maxQuantity ? `${rule.minQuantity} - ${rule.maxQuantity}` : `${rule.minQuantity}+`}
                    </td>
                    <td className="py-4 pr-4 text-sm text-primary font-semibold">
                      R{rule.tierPrice.toFixed(2)}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(rule)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-gray-200 hover:bg-primary/20 hover:text-primary transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <Link
                          href={`/admin/products/${rule.productId}/bulk-pricing`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-gray-200 hover:bg-zinc-700 transition-colors"
                        >
                          Product
                        </Link>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          disabled={deletingId === rule.id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === rule.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">Edit Bulk Deal</h3>
              <p className="text-sm text-gray-400">{editingRule.product.name}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-300">Min Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={editForm.minQuantity}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, minQuantity: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-gray-300">Max Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={editForm.maxQuantity}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, maxQuantity: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
                  placeholder="Optional"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-gray-300">Tier Price</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editForm.tierPrice}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, tierPrice: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 rounded-full bg-primary px-4 py-3 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingRule(null)}
                className="flex-1 rounded-full bg-zinc-800 px-4 py-3 font-bold text-white transition-colors hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {configureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Configure Bulk Pricing</h3>
                <p className="text-sm text-gray-400">Find one product quickly or configure all products in a subcategory.</p>
              </div>
              <button
                onClick={() => setConfigureOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5 flex gap-2 rounded-full bg-zinc-900 p-1">
              <button
                onClick={() => {
                  setConfigureMode('product')
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${configureMode === 'product' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Search Product
              </button>
              <button
                onClick={() => setConfigureMode('subcategory')}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${configureMode === 'subcategory' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'}`}
              >
                Choose Subcategory
              </button>
            </div>

            {configureMode === 'product' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Start typing a product name..."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-3 pl-9 pr-4 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="max-h-80 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900">
                  {productSearching ? (
                    <div className="p-4 text-sm text-gray-400">Searching products...</div>
                  ) : productResults.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400">
                      Type at least 2 characters to search eligible products.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800">
                      {productResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => openProductBulkPricing(product.id)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-800"
                        >
                          <div>
                            <div className="font-semibold text-white">{product.name}</div>
                            <div className="text-sm text-gray-400">
                              {product.category}{product.subcategory ? ` / ${product.subcategory}` : ''} · R{product.price.toFixed(2)}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SUBCATEGORIES.map((subcategory) => (
                  <button
                    key={subcategory.value}
                    onClick={() => openSubcategorySetup(subcategory.value)}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-left transition-colors hover:border-primary hover:bg-primary/10"
                  >
                    <div>
                      <div className="font-semibold text-white">{subcategory.label}</div>
                      <div className="text-sm text-gray-400">Set one tier ladder and apply it to all products in this subcategory</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showHowItWorks && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">How Bulk Pricing Works</h3>
                <p className="text-sm text-gray-400">Set one-off product deals or apply one ladder to a full subcategory.</p>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close help modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="font-semibold text-white">Option 1: Product-specific deal</p>
                <p>Use Search Product, open one product, then set tiers only for that product.</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="font-semibold text-white">Option 2: Category-wide deal</p>
                <p>Use Choose Subcategory, define one tier ladder, then apply to all products in that subcategory.</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                <p className="font-semibold text-white">Example Ladder</p>
                <p>1 unit - R65</p>
                <p>2 units - R120</p>
                <p>3+ units - R170</p>
                <p className="mt-2 text-gray-300">At checkout, the highest matching tier is used for the quantity in cart.</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="font-semibold text-white">Tier Rules</p>
                <p>Min quantity is required.</p>
                <p>Max quantity is optional; leave blank to make the tier open-ended.</p>
                <p>Tier price is the total price for that tier quantity range.</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="w-full rounded-full bg-primary px-4 py-3 font-bold text-white transition-colors hover:bg-primary/90"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
