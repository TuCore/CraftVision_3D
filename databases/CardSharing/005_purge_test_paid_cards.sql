-- One-time cleanup of legacy test DigitalCard checkouts/purchases created up to 2026-10-31 (UTC+7).
-- Tracked in CardDataMigrations so post-deploy customer purchases are never affected on future restarts.
CREATE TABLE IF NOT EXISTS "CardDataMigrations" (
    "MigrationId" varchar(150) PRIMARY KEY,
    "AppliedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $cleanup$
DECLARE
    target_ids uuid[];
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "CardDataMigrations" WHERE "MigrationId" = '20261031_purge_test_paid_cards'
    ) THEN
        SELECT COALESCE(array_agg(DISTINCT c."Id"), ARRAY[]::uuid[])
        INTO target_ids
        FROM "Cards" c
        LEFT JOIN "CardPayments" cp ON cp."CardId" = c."Id"
        WHERE (c."PaidAt" IS NOT NULL AND c."PaidAt" <= '2026-10-31 23:59:59+07'::timestamptz)
           OR (cp."CardId" IS NOT NULL AND c."UpdatedAt" <= '2026-10-31 23:59:59+07'::timestamptz);

        IF cardinality(target_ids) > 0 THEN
            -- Strict Child -> Parent foreign key deletion order (CardPayments has ON DELETE RESTRICT to Cards)
            DELETE FROM "PublishedAssets" WHERE "CardId" = ANY(target_ids);
            DELETE FROM "CardPayments" WHERE "CardId" = ANY(target_ids);
            DELETE FROM "Cards" WHERE "Id" = ANY(target_ids);
        END IF;

        INSERT INTO "CardDataMigrations" ("MigrationId")
        VALUES ('20261031_purge_test_paid_cards')
        ON CONFLICT ("MigrationId") DO NOTHING;
    END IF;
END $cleanup$;
