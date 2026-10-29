-- Additive upgrade: this singleton has no foreign keys and never changes historical card data.
CREATE TABLE IF NOT EXISTS "CardTutorialSettings" (
    "Id" integer PRIMARY KEY CHECK ("Id" = 1),
    "HeaderTitle" varchar(160) NOT NULL,
    "VideoUrl" varchar(2048) NULL,
    "CaptionTitle" varchar(160) NOT NULL DEFAULT '',
    "CaptionDesc" varchar(2000) NOT NULL DEFAULT '',
    "DetailUrl" varchar(2048) NOT NULL DEFAULT '',
    "Revision" integer NOT NULL DEFAULT 1,
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed once. A null VideoUrl records intentional removal and must never be reseeded.
INSERT INTO "CardTutorialSettings" ("Id", "HeaderTitle", "VideoUrl", "CaptionTitle", "CaptionDesc", "DetailUrl")
VALUES (1, 'Video Hướng Dẫn Thanh Toán', '/videos/payment-tutorial.mp4',
    'Hướng Dẫn Thanh Toán An Toàn',
    'Hướng dẫn thanh toán qua PayOS: mở ứng dụng ngân hàng, quét mã QR trên trang thanh toán và kiểm tra thông tin trước khi xác nhận.', '/shop')
ON CONFLICT ("Id") DO NOTHING;
