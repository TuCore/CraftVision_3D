-- Forward-only, idempotent upgrade: preserve all existing drafts and publications.
-- Existing publications remain stored but are inaccessible until the card is paid.
ALTER TABLE "Cards" ADD COLUMN IF NOT EXISTS "PaidAt" timestamptz NULL;
CREATE SEQUENCE IF NOT EXISTS "CardPaymentOrderCodes" START WITH 7000000000000000 MAXVALUE 7999999999999999;
CREATE TABLE IF NOT EXISTS "CardPayments" (
  "CardId" uuid PRIMARY KEY REFERENCES "Cards"("Id") ON DELETE RESTRICT,
  "OrderCode" bigint NOT NULL UNIQUE DEFAULT nextval('"CardPaymentOrderCodes"'),
  "Amount" integer NOT NULL CHECK ("Amount" > 0),
  "LinkId" text NULL,
  "CheckoutUrl" text NULL,
  "Status" text NOT NULL DEFAULT 'PENDING'
);
