# Database Schema Update Required

## Steps to Apply Changes

1. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name add-customer-fields-to-order
   ```

3. **Restart Dev Server**
   ```bash
   npm run dev
   ```

## Changes Made

### Order Model Updates:
- Made `userId` optional (for guest orders)
- Made `user` relation optional
- Added `customerEmail` field (required)
- Added `customerName` field (required)
- Added `customerPhone` field (required)

### Why These Changes:
- Allows guest checkout without user account
- Stores customer contact info directly on order
- Maintains user relationship when logged in
- Enables order processing and email notifications

## After Migration

Test the order creation flow:
1. Add items to cart as guest
2. Go to checkout
3. Fill in customer details
4. Complete payment
5. Verify order is created with status "PROCESSING"
6. Check email for confirmation
