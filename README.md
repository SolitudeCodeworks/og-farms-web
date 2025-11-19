# OG Farms - Premium Cannabis E-Commerce Platform

A modern, full-featured e-commerce platform for cannabis products built with Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

### 🛒 E-Commerce Core
- **Product Catalog** with categories (Flower, Accessories, Bongs, Grinders, Papers, Vapes)
- **Shopping Cart** with localStorage for guests and database sync for logged-in users
- **Product Details** with image galleries, THC/CBD content display
- **Search & Filters** by category, price, and keywords

### 👤 User Management
- **Authentication** with NextAuth.js (credentials-based)
- **User Registration & Login**
- **Session Management** with JWT

### ⭐ Reviews & Ratings
- **Product Reviews** with 5-star rating system
- **Verified Purchase** badges for customers who bought the product
- **Helpful Votes** on reviews
- **Average Rating** calculation and display

### 🔗 Smart Recommendations
- **Frequently Bought Together** - AI-powered product recommendations based on purchase history
- **Featured Products** section on homepage

### 🎨 Design
- **Dark Theme** with green accent colors (cannabis-themed)
- **Fully Responsive** mobile-first design
- **Modern UI** with smooth animations and transitions
- **SEO Optimized** with proper meta tags

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **State Management:** Zustand
- **Image Storage:** Vercel Blob
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- Vercel account (for Blob storage and deployment)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd og-farms-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Vercel Blob (for image storage)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

**Generate NextAuth Secret:**
```bash
openssl rand -base64 32
```

4. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Database Schema

### Core Models
- **User** - Customer accounts with authentication
- **Product** - Product catalog with THC/CBD content, ratings, sales tracking
- **CartItem** - Shopping cart items (synced with DB for logged-in users)
- **Order** - Order history and management
- **OrderItem** - Individual items in orders
- **Address** - Customer shipping addresses

### Social Features
- **Review** - Product reviews with ratings and verified purchase badges
- **WishlistItem** - User wishlists
- **FrequentlyBoughtTogether** - Product recommendation engine

## Key Features Implementation

### Cart Synchronization
- **Guests:** Cart stored in localStorage using Zustand
- **Logged-in Users:** Cart synced to database automatically
- **Session Transition:** Cart migrates from localStorage to DB on login

### Review System
- Users can leave reviews with 1-5 star ratings
- Verified purchase badge for customers who bought the product
- Helpful votes to surface quality reviews
- Automatic average rating calculation

### Frequently Bought Together
- Tracks product pairs purchased in same orders
- Displays top recommendations on product pages
- Updates automatically with each completed order

## Project Structure

```
og-farms-web/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   └── auth/            # Authentication endpoints
│   ├── cart/                # Shopping cart page
│   ├── login/               # Login page
│   ├── product/[slug]/      # Product detail pages
│   ├── register/            # Registration page
│   ├── shop/                # Product listing page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── home/               # Homepage components
│   ├── layout/             # Layout components (Header, Footer)
│   ├── product/            # Product-related components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions and configurations
│   ├── actions/           # Server actions
│   │   ├── cart.ts       # Cart operations
│   │   ├── products.ts   # Product operations
│   │   └── reviews.ts    # Review operations
│   ├── store/            # Zustand stores
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/                # Database schema and migrations
│   └── schema.prisma     # Prisma schema
└── public/               # Static assets

```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables in Vercel dashboard
- Deploy!

3. **Set up Vercel Blob**
- In Vercel dashboard, go to Storage → Blob
- Create a new Blob store
- Copy the token to your environment variables

## Environment Variables for Production

Make sure to add these in your Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `BLOB_READ_WRITE_TOKEN`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
