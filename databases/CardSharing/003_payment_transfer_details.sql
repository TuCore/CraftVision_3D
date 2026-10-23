-- Forward-only, idempotent upgrade for the shared in-app transfer screen.
ALTER TABLE "CardPayments" ADD COLUMN IF NOT EXISTS "QrCode" text NULL;
ALTER TABLE "CardPayments" ADD COLUMN IF NOT EXISTS "Bin" text NULL;
ALTER TABLE "CardPayments" ADD COLUMN IF NOT EXISTS "AccountNumber" text NULL;
ALTER TABLE "CardPayments" ADD COLUMN IF NOT EXISTS "AccountName" text NULL;
ALTER TABLE "CardPayments" ADD COLUMN IF NOT EXISTS "Description" text NULL;
