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
  images?: string[];
  isComingSoon?: boolean;
  stock?: number;
}


