export interface TemplateProduct {
  id: number;
  image: string;
  title: string;
  sold: number;
  originalPrice: number;
  price: number;
  discount: number;
}

export const INITIAL_TEMPLATE_PRODUCTS: TemplateProduct[] = [
  {
    id: 17,
    image: "/cards/previews/starlight-birthday.webp",
    title: "Điều ước sinh nhật dệt từ ánh sao",
    sold: 188,
    originalPrice: 89999,
    price: 49999,
    discount: 44,
  },
  { 
    id: 1, 
    image: "/dreamy-hero-bg.jpg", 
    title: "Trung thu - Ngàn Đèn Lồng, Một Lời Thương", 
    sold: 116, 
    originalPrice: 69998, 
    price: 49999, 
    discount: 40,
  },
  { 
    id: 2, 
    image: "/dreamy-hero-bg.jpg", 
    title: "TRUNG THU - Đèn hoa dưới ánh trăng 🌸", 
    sold: 227, 
    originalPrice: 69998, 
    price: 49999, 
    discount: 40,
  },
  { 
    id: 3, 
    image: "/dreamy-hero-bg.jpg", 
    title: "VIP - Món quà kỷ niệm, tình yêu, sinh nhật", 
    sold: 491, 
    originalPrice: 69998, 
    price: 49999, 
    discount: 40,
  },
  { id: 4, image: "/dreamy-hero-bg.jpg", title: "LOVE VIP - Mưa lời yêu thương 3D", sold: 144, originalPrice: 66665, price: 39999, discount: 40 },
  { id: 5, image: "/dreamy-hero-bg.jpg", title: "Món quà tình yêu lấp lánh", sold: 89, originalPrice: 49999, price: 29999, discount: 40 },
  { id: 6, image: "/dreamy-hero-bg.jpg", title: "Thiệp chúc mừng ngày phụ nữ 20/10", sold: 342, originalPrice: 55000, price: 33000, discount: 40 },
  { id: 7, image: "/dreamy-hero-bg.jpg", title: "Happy Birthday - Vũ trụ tình yêu", sold: 56, originalPrice: 80000, price: 48000, discount: 40 },
  { id: 8, image: "/dreamy-hero-bg.jpg", title: "Kỷ niệm ngày cưới 3D đặc biệt", sold: 12, originalPrice: 100000, price: 60000, discount: 40 },
  { id: 9, image: "/dreamy-hero-bg.jpg", title: "Trung thu - Ngàn Đèn Lồng, Một Lời Thương (Mẫu 2)", sold: 116, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 10, image: "/dreamy-hero-bg.jpg", title: "TRUNG THU - Đèn hoa dưới ánh trăng 🌸 (Mẫu 2)", sold: 227, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 11, image: "/dreamy-hero-bg.jpg", title: "VIP - Món quà kỷ niệm, tình yêu, sinh nhật (Mẫu 2)", sold: 491, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 12, image: "/dreamy-hero-bg.jpg", title: "LOVE VIP - Mưa lời yêu thương 3D (Mẫu 2)", sold: 144, originalPrice: 66665, price: 39999, discount: 40 },
  { id: 13, image: "/dreamy-hero-bg.jpg", title: "Món quà tình yêu lấp lánh (Mẫu 2)", sold: 89, originalPrice: 49999, price: 29999, discount: 40 },
  { id: 14, image: "/dreamy-hero-bg.jpg", title: "Thiệp chúc mừng ngày phụ nữ 20/10 (Mẫu 2)", sold: 342, originalPrice: 55000, price: 33000, discount: 40 },
  { id: 15, image: "/dreamy-hero-bg.jpg", title: "Happy Birthday - Vũ trụ tình yêu (Mẫu 2)", sold: 56, originalPrice: 80000, price: 48000, discount: 40 },
  { id: 16, image: "/dreamy-hero-bg.jpg", title: "Kỷ niệm ngày cưới 3D đặc biệt (Mẫu 2)", sold: 12, originalPrice: 100000, price: 60000, discount: 40 },
];
