CREATE TABLE IF NOT EXISTS "MusicTracks" (
    "Id" uuid PRIMARY KEY,
    "Title" varchar(120) NOT NULL,
    "SourceUrl" varchar(2048),
    "AudioData" bytea,
    "ContentType" varchar(32),
    "IsEnabled" boolean NOT NULL DEFAULT true,
    "SortOrder" integer NOT NULL DEFAULT 0 CHECK ("SortOrder" BETWEEN 0 AND 10000),
    "Revision" integer NOT NULL DEFAULT 1,
    "MediaVersion" integer NOT NULL DEFAULT 1,
    CONSTRAINT "MusicTracks_Source" CHECK (
        ("SourceUrl" IS NOT NULL AND "AudioData" IS NULL AND "ContentType" IS NULL)
        OR ("SourceUrl" IS NULL AND "AudioData" IS NOT NULL AND "ContentType" IS NOT NULL)
    )
);
CREATE INDEX IF NOT EXISTS "MusicTracks_Playlist" ON "MusicTracks" ("IsEnabled", "SortOrder", "Id");
