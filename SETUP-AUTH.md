# Authentication & Role Setup Guide

## Overview
Your app now has a complete authentication system with:
- ✅ User registration and login
- ✅ Role-based access (ADMIN & CUSTOMER)
- ✅ Age verification (18+) for South African law compliance
- ✅ Protected routes and API endpoints

## Database Schema Changes

### User Model Updates
Added the following fields to the User model:
- `dateOfBirth` - User's date of birth
- `ageVerified` - Boolean flag indicating if user is 18+
- `verifiedAt` - Timestamp of verification

### Roles
- **CUSTOMER** (default) - Can purchase products after age verification
- **ADMIN** - Full access to admin dashboard and management features

## Required Setup Steps

### 1. Update Environment Variables
Make sure your `.env` file has:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/og_farms"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your-paystack-public-key"
PAYSTACK_SECRET_KEY="your-paystack-secret-key"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"
```

### 2. Run Database Migration
```bash
# Generate Prisma client with new schema
npx prisma generate

# Create migration for age verification fields
npx prisma migrate dev --name add_age_verification

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 3. Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Start fresh
npm run dev
```

## Features Implemented

### 1. Age Verification Modal
- **Component**: `components/auth/age-verification-modal.tsx`
- Prompts users to verify they are 18+
- Validates date of birth
- Stores verification in database

### 2. Auth Helper Functions
- **File**: `lib/auth-helpers.ts`
- `getCurrentUser()` - Get current logged-in user
- `requireAuth()` - Require authentication
- `requireAdmin()` - Require admin role
- `requireAgeVerification()` - Require age verification
- `isOver18()` - Check if user is 18+

### 3. API Routes
- `/api/auth/register` - User registration
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/auth/verify-age` - Age verification endpoint

### 4. Protected Routes
You can now protect routes using middleware or server-side checks:

```typescript
// In any server component or API route
import { requireAdmin, requireAgeVerification } from "@/lib/auth-helpers"

// Require admin access
export async function GET() {
  await requireAdmin()
  // Admin-only logic here
}

// Require age verification
export async function POST() {
  await requireAgeVerification()
  // Age-restricted logic here
}
```

## Usage Examples

### Show Age Verification Modal
```typescript
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { AgeVerificationModal } from "@/components/auth/age-verification-modal"

export function CheckoutPage() {
  const { data: session } = useSession()
  const [showAgeModal, setShowAgeModal] = useState(false)

  useEffect(() => {
    // Check if user needs age verification
    if (session?.user && !session.user.ageVerified) {
      setShowAgeModal(true)
    }
  }, [session])

  return (
    <>
      <AgeVerificationModal 
        isOpen={showAgeModal} 
        onClose={() => setShowAgeModal(false)} 
      />
      {/* Your checkout content */}
    </>
  )
}
```

### Check User Role
```typescript
import { useSession } from "next-auth/react"

export function AdminButton() {
  const { data: session } = useSession()
  
  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return <button>Admin Dashboard</button>
}
```

## Admin Dashboard
To create an admin user, you can:

1. **Via Prisma Studio**:
   ```bash
   npx prisma studio
   ```
   - Open User table
   - Find your user
   - Change `role` from `CUSTOMER` to `ADMIN`

2. **Via SQL**:
   ```sql
   UPDATE "User" 
   SET role = 'ADMIN' 
   WHERE email = 'your-email@example.com';
   ```

## Next Steps

1. ✅ Run the database migration commands above
2. ✅ Test user registration
3. ✅ Test age verification flow
4. ✅ Create admin user
5. ✅ Build admin dashboard (next task)

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- Age verification is stored permanently
- JWT sessions with NextAuth
- Role-based access control ready
- All auth routes are protected

## Compliance

✅ **South African Law**: Age verification ensures compliance with cannabis sale regulations (18+ only)
✅ **Data Privacy**: User data is securely stored and encrypted
✅ **Audit Trail**: `verifiedAt` timestamp for compliance records
