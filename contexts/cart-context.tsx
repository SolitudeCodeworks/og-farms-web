"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  category: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  syncWithDB: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // On mount: Load from DB if logged in, otherwise from localStorage
  useEffect(() => {
    const initializeCart = async () => {
      if (session?.user) {
        // Logged in: Fetch from DB and overwrite localStorage
        try {
          const response = await fetch('/api/cart')
          if (response.ok) {
            const data = await response.json()
            const dbItems = data.items.map((item: any) => ({
              id: item.productId,
              name: item.product.name,
              price: item.product.price,
              image: item.product.images[0] || '/products/placeholder.jpg',
              quantity: item.quantity,
              category: item.product.category,
            }))
            setItems(dbItems)
            localStorage.setItem('cart', JSON.stringify(dbItems))
          }
        } catch (error) {
          console.error('Error loading cart from DB:', error)
          // Fallback to localStorage
          const savedCart = localStorage.getItem('cart')
          if (savedCart) {
            setItems(JSON.parse(savedCart))
          }
        }
      } else {
        // Guest: Load from guestCart localStorage
        const savedCart = localStorage.getItem('guestCart')
        if (savedCart) {
          // Convert guestCart format to CartItem format
          const guestItems = JSON.parse(savedCart).map((item: any) => ({
            id: item.productId,
            name: item.productName,
            price: item.productPrice,
            image: item.productImage,
            quantity: item.quantity,
            category: item.category || 'FLOWER',
          }))
          setItems(guestItems)
        }
      }
      setIsInitialized(true)
    }

    initializeCart()
  }, [session])

  // Save to localStorage whenever cart changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      if (session?.user) {
        // Logged in: save to 'cart'
        localStorage.setItem('cart', JSON.stringify(items))
      } else {
        // Guest: save to 'guestCart' in the format expected
        const guestCart = items.map(item => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          productPrice: item.price,
          quantity: item.quantity,
          category: item.category,
          ageRestricted: false, // Default, would need to track this
        }))
        localStorage.setItem('guestCart', JSON.stringify(guestCart))
      }
      // Dispatch event to update cart count in header and dropdown
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }, [items, isInitialized, session])

  // Sync to DB for logged-in users
  const syncToDatabase = async (updatedItems: CartItem[]) => {
    if (!session?.user) return

    try {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
          }))
        })
      })
    } catch (error) {
      console.error('Error syncing to DB:', error)
    }
  }

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      let newItems: CartItem[]
      
      if (existingItem) {
        newItems = prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        newItems = [...prevItems, { ...item, quantity: 1 }]
      }
      
      // Don't sync here - let the product pages handle DB sync
      // This prevents duplicate API calls
      
      return newItems
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id)
      syncToDatabase(newItems)
      return newItems
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
      syncToDatabase(newItems)
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
    syncToDatabase([])
  }

  const syncWithDB = async () => {
    if (session?.user) {
      await syncToDatabase(items)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        syncWithDB,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
