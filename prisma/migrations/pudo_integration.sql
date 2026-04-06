-- PUDO Integration Migration
-- Safe additive changes only – run manually on prod after testing locally
-- Date: 2026-03-17

-- 1. Add PUDO to FulfillmentType enum (PostgreSQL requires special handling)
ALTER TYPE "FulfillmentType" ADD VALUE IF NOT EXISTS 'PUDO';

-- 2. Add PUDO columns to Order table
ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "pudoShipmentId"        TEXT,
  ADD COLUMN IF NOT EXISTS "pudoTrackingReference"  TEXT,
  ADD COLUMN IF NOT EXISTS "pudoLockerCode"         TEXT,
  ADD COLUMN IF NOT EXISTS "pudoLockerName"         TEXT,
  ADD COLUMN IF NOT EXISTS "pudoLockerAddress"      TEXT,
  ADD COLUMN IF NOT EXISTS "pudoServiceLevelCode"   TEXT,
  ADD COLUMN IF NOT EXISTS "pudoRate"               DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "pudoStatus"             TEXT,
  ADD COLUMN IF NOT EXISTS "pudoLabelUrl"           TEXT;

-- 3. Create PudoLocker cache table
CREATE TABLE IF NOT EXISTS "PudoLocker" (
  "id"          TEXT NOT NULL,
  "code"        TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "address"     TEXT NOT NULL,
  "latitude"    TEXT,
  "longitude"   TEXT,
  "town"        TEXT,
  "postalCode"  TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "rawData"     JSONB,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PudoLocker_pkey" PRIMARY KEY ("id")
);

-- 4. Unique index on locker code
CREATE UNIQUE INDEX IF NOT EXISTS "PudoLocker_code_key" ON "PudoLocker"("code");

-- 5. Supporting indexes
CREATE INDEX IF NOT EXISTS "PudoLocker_isActive_idx" ON "PudoLocker"("isActive");
CREATE INDEX IF NOT EXISTS "PudoLocker_town_idx"     ON "PudoLocker"("town");

-- Done – run `npx prisma generate` after applying this migration
