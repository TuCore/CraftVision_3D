START TRANSACTION;

-- One-time production repair for migrations blocked by the pre-migration
-- BankTransfer enum update. Back up the database before running this script.
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
        IF NOT EXISTS (
            SELECT 1
            FROM "__EFMigrationsHistory"
            WHERE migration_id = '20261008033125_AddCartAndWishlist'
        ) THEN
            RAISE EXCEPTION 'Required baseline migration 20261008033125_AddCartAndWishlist is missing.';
        END IF;

        IF to_regclass('public.cart_items') IS NULL
            OR NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'cart_items'
                  AND column_name = 'cart_id'
            )
            OR NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'cart_items'
                  AND column_name = 'selected_options'
            )
            OR EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'cart_items'
                  AND column_name = 'user_id'
            ) THEN
            RAISE EXCEPTION 'The existing cart_items table does not match AddCartAndWishlist.';
        END IF;

        IF to_regclass('public.device_push_tokens') IS NOT NULL
            OR to_regclass('public.favorites') IS NOT NULL
            OR to_regclass('public.password_reset_tokens') IS NOT NULL
            OR to_regclass('public.user_notifications') IS NOT NULL
            OR to_regclass('public.vouchers') IS NOT NULL THEN
            RAISE EXCEPTION 'Partial AddMobileCommerceApis schema detected. Stop and reconcile it manually.';
        END IF;

    ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'BankTransfer' BEFORE 'Cod';
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS vector;
    END IF;
END $EF$;

-- AddCartAndWishlist already owns cart_items. The generated AddMobileCommerceApis
-- migration attempted to recreate it with an incompatible schema, so it is
-- intentionally preserved here to match the current EF model.
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE TABLE device_push_tokens (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        token text NOT NULL,
        platform text NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_device_push_tokens PRIMARY KEY (id),
        CONSTRAINT fk_device_push_tokens_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE TABLE favorites (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        product_id uuid NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_favorites PRIMARY KEY (id),
        CONSTRAINT fk_favorites_products_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        CONSTRAINT fk_favorites_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE TABLE password_reset_tokens (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        token_hash text NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        used_at timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
        CONSTRAINT fk_password_reset_tokens_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE TABLE user_notifications (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        title text NOT NULL,
        body text NOT NULL,
        type text NOT NULL,
        is_read boolean NOT NULL,
        created_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_user_notifications PRIMARY KEY (id),
        CONSTRAINT fk_user_notifications_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE TABLE vouchers (
        id uuid NOT NULL,
        code text NOT NULL,
        discount_percent numeric NOT NULL,
        maximum_discount numeric,
        minimum_order_amount numeric NOT NULL,
        is_active boolean NOT NULL,
        starts_at timestamp with time zone NOT NULL,
        ends_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_vouchers PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE UNIQUE INDEX ix_device_push_tokens_token ON device_push_tokens (token);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE INDEX ix_device_push_tokens_user_id ON device_push_tokens (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE INDEX ix_favorites_product_id ON favorites (product_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE UNIQUE INDEX ix_favorites_user_id_product_id ON favorites (user_id, product_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE UNIQUE INDEX ix_password_reset_tokens_token_hash ON password_reset_tokens (token_hash);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE INDEX ix_password_reset_tokens_user_id ON password_reset_tokens (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE INDEX ix_user_notifications_user_id ON user_notifications (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    CREATE UNIQUE INDEX ix_vouchers_code ON vouchers (code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    INSERT INTO vouchers (id, code, discount_percent, maximum_discount, minimum_order_amount, is_active, starts_at, ends_at)
    VALUES ('11111111-1111-1111-1111-111111111111', 'WELCOME10', 10.0, 100000.0, 200000.0, TRUE, TIMESTAMPTZ '2026-01-01T00:00:00Z', TIMESTAMPTZ '2030-01-01T00:00:00Z');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261014063309_AddMobileCommerceApis') THEN
    INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
    VALUES ('20261014063309_AddMobileCommerceApis', '10.0.9');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261020052834_AddImageUrlAndSuggestionsToAiChatMessage') THEN
    ALTER TABLE ai_chat_messages ADD image_url text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261020052834_AddImageUrlAndSuggestionsToAiChatMessage') THEN
    ALTER TABLE ai_chat_messages ADD suggestions_json text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261020052834_AddImageUrlAndSuggestionsToAiChatMessage') THEN
    INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
    VALUES ('20261020052834_AddImageUrlAndSuggestionsToAiChatMessage', '10.0.9');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261022161835_RecordDigitalCardOrders') THEN
    ALTER TABLE orders ADD card_id uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261022161835_RecordDigitalCardOrders') THEN
    ALTER TABLE orders ADD card_template_slug text;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261022161835_RecordDigitalCardOrders') THEN
    ALTER TABLE orders ADD order_kind text NOT NULL DEFAULT 'Product';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261022161835_RecordDigitalCardOrders') THEN
    CREATE UNIQUE INDEX ix_orders_card_id ON orders (card_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20261022161835_RecordDigitalCardOrders') THEN
    INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
    VALUES ('20261022161835_RecordDigitalCardOrders', '10.0.9');
    END IF;
END $EF$;
COMMIT;

