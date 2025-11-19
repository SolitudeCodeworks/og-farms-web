# Quick Setup Commands

Run these commands in order to get your OG Farms website up and running:

## 1. Create Environment File

Create a `.env` file in the root directory with:

```env
DATABASE_URL="your-neon-database-url-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

## 2. Generate Prisma Client

```bash
npx prisma generate
```

## 3. Push Database Schema

```bash
npx prisma db push
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Open in Browser

Navigate to: http://localhost:3000

---

## Database Features Implemented

### ✅ Cart Management
- **Logged-in users**: Cart saved to database
- **Guest users**: Cart saved to localStorage
- **Auto-sync**: Cart migrates to DB when user logs in

### ✅ Product Reviews & Ratings
- 5-star rating system
- Written reviews with title and comment
- Verified purchase badges
- Helpful votes on reviews
- Average rating calculation

### ✅ Frequently Bought Together
- Automatically tracks products purchased together
- Displays recommendations on product pages
- Updates with each completed order

### ✅ User Authentication
- Registration with email/password
- Login with NextAuth.js
- Session management
- Protected routes

---

## Next Steps

1. **Add Products**: Use Prisma Studio or create an admin panel
   ```bash
   npx prisma studio
   ```

2. **Upload Images**: Set up Vercel Blob storage for product images

3. **Test Features**:
   - Register a new account
   - Browse products
   - Add items to cart
   - Leave reviews (after "purchasing")
   - Check frequently bought together

4. **Deploy to Vercel**:
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy!

---

## Troubleshooting

### Prisma Client Not Found
```bash
npx prisma generate
```

### Database Connection Issues
- Check your `DATABASE_URL` in `.env`
- Ensure Neon database is running
- Verify connection string format

### NextAuth Errors
- Generate a new `NEXTAUTH_SECRET`
- Check `NEXTAUTH_URL` matches your domain

### Cart Not Syncing
- Check browser console for errors
- Verify user is logged in
- Check database connection
