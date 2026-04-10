-- AddColumn (safe: additive only, does not touch existing data)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pfPaymentId" TEXT;
