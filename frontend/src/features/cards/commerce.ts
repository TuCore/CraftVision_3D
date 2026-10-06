import { cardTemplates } from "./catalog";
import cardPrices from "@/data/card-prices.json";

export interface CardCommerce {
  sold?: number;
  originalPrice?: number;
  salePrice?: number;
  videoUrl?: string;
}

// card-schema.test.cjs verifies this client copy matches the server price contract.
export const cardCommerce: Record<string, CardCommerce> = Object.fromEntries(
  cardTemplates.map(({ slug }) => [slug, { salePrice: (cardPrices as Record<string, number>)[slug] }]),
);
export const sharedCardCommerce: CardCommerce = {
  videoUrl: "/videos/payment-tutorial.mp4",
};

export function getCardCommerce(slug: string): CardCommerce {
  return { ...sharedCardCommerce, ...cardCommerce[slug] };
}

export function formatCardPrice(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
}
