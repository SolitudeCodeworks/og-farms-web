# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Vercel Blob (for image storage)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

## How to Get These Values

### 1. Neon Database
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste it as `DATABASE_URL`

### 2. NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

### 3. Vercel Blob Token
1. Go to your Vercel project dashboard
2. Navigate to Storage → Blob
3. Create a new Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN`

## After Setting Up Environment Variables

Run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```
