import { cardTemplates } from "./catalog";

export interface CardCommerce {
  sold?: number;
  originalPrice?: number;
  salePrice?: number;
  videoUrl?: string;
}

const standardCards = new Set([
  "birthday-wish", "birthday-bear", "tet-apricot", "tet-peach",
  "mothers-day", "fathers-day", "vu-lan", "womens-day",
  "vietnamese-women", "candy-world", "dinosaur-friend", "star-lantern",
  "moon-rabbit", "christmas-tree", "reindeer-mail", "halloween-pumpkin",
  "national-day", "peace-dove", "lotus-peace", "thank-you-tea",
]);
const premiumCards = new Set([
  "rose-love", "memory-train", "secret-ring", "our-music",
  "birthday-space", "birthday-stage", "tet-reunion", "new-year-clock",
  "family-home", "family-tree", "graduation", "lantern-street",
  "snow-globe", "grand-opening",
]);

// Prices are assigned by stable slug; sales counts and reference prices await real data.
export const cardCommerce: Record<string, CardCommerce> = Object.fromEntries(
  cardTemplates.map(({ slug }) => [slug, {
    salePrice: premiumCards.has(slug) ? 49000 : standardCards.has(slug) ? 29000 : 39000,
  }]),
);
export const sharedCardCommerce: CardCommerce = {
  videoUrl: "https://youtu.be/nT1jwkHs0I8?si=yimdIpy9oQmEvsRp",
};

export function getCardCommerce(slug: string): CardCommerce {
  return { ...sharedCardCommerce, ...cardCommerce[slug] };
}

export function formatCardPrice(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
}
