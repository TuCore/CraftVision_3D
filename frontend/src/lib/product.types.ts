export type Category = string;

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category | string;
  image: string;
  rating: number;
  description: string;
  matchScore: number;
  productType?: string;
  supportsNfc?: boolean;
  images?: string[];
  isComingSoon?: boolean;
  stock?: number;
  availableStock?: number;
  reservedStock?: number;
  is3D?: boolean;
  isDigital?: boolean;
  cardSlug?: string;
  isCardTemplate?: boolean;
}


