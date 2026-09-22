export type Category = "Móc khoá" | "Vòng tay" | "Dây chuyền" | "Charm" | "Đồ trang trí";

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
}


