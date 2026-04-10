-- Add PUDO value to FulfillmentType enum (safe, non-destructive)
ALTER TYPE "FulfillmentType" ADD VALUE IF NOT EXISTS 'PUDO';
