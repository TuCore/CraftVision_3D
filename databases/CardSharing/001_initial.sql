-- Applied only to the dedicated Cards database. Safe to repeat on populated data.
CREATE TABLE IF NOT EXISTS "Cards" (
  "Id" uuid PRIMARY KEY, "OwnerId" uuid NOT NULL,
  "DraftJson" text NOT NULL, "PublishedJson" text NULL,
  "ShareToken" varchar(43) NULL UNIQUE, "Revision" integer NOT NULL,
  "UpdatedAt" timestamptz NOT NULL, "PublishedAt" timestamptz NULL
);
CREATE INDEX IF NOT EXISTS "IX_Cards_OwnerId" ON "Cards" ("OwnerId");
CREATE TABLE IF NOT EXISTS "Assets" (
  "Id" uuid PRIMARY KEY, "OwnerId" uuid NOT NULL, "StorageUrl" text NOT NULL,
  "ContentType" text NOT NULL, "Length" bigint NOT NULL, "Hash" varchar(64) NOT NULL,
  UNIQUE ("OwnerId", "Hash")
);
CREATE TABLE IF NOT EXISTS "PublishedAssets" (
  "CardId" uuid NOT NULL REFERENCES "Cards"("Id") ON DELETE CASCADE,
  "AssetId" uuid NOT NULL REFERENCES "Assets"("Id") ON DELETE RESTRICT,
  PRIMARY KEY ("CardId", "AssetId")
);
CREATE INDEX IF NOT EXISTS "IX_PublishedAssets_AssetId" ON "PublishedAssets" ("AssetId");
