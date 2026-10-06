export interface TemplateVideo {
  id: number;
  templateId: number;
  headerTitle: string;
  videoUrl: string;
  captionTitle: string;
  captionDesc: string;
  detailUrl?: string;
}

export interface TemplateProduct {
  id: number;
  image: string;
  title: string;
  sold: number;
  originalPrice: number;
  price: number;
  discount: number;
  video?: TemplateVideo;
}

// Default video used when a template has not customized its own
export const DEFAULT_TUTORIAL_VIDEO: Omit<TemplateVideo, "id" | "templateId"> = {
  headerTitle: "Video Hướng Dẫn Thanh Toán",
  videoUrl: "/videos/payment-tutorial.mp4",
  captionTitle: "Hướng Dẫn Thanh Toán An Toàn",
  captionDesc: "Hướng dẫn thanh toán qua PayOS: mở ứng dụng ngân hàng, quét mã QR trên trang thanh toán và kiểm tra thông tin trước khi xác nhận.",
  detailUrl: "/shop",
};

export const INITIAL_TEMPLATE_PRODUCTS: TemplateProduct[] = [
  { 
    id: 1, 
    image: "/dreamy-hero-bg.jpg", 
    title: "Trung thu - Ngàn Đèn Lồng, Một Lời Thương", 
    sold: 116, 
    originalPrice: 69998, 
    price: 49999, 
    discount: 40,
    video: {
      id: 1,
      templateId: 1,
      headerTitle: "Video Hướng Dẫn Thanh Toán",
      videoUrl: "/videos/payment-tutorial.mp4",
      captionTitle: "Hướng Dẫn Thanh Toán An Toàn",
      captionDesc: "Hướng dẫn thanh toán qua PayOS: mở ứng dụng ngân hàng, quét mã QR trên trang thanh toán và kiểm tra thông tin trước khi xác nhận.",
      detailUrl: "/shop"
    }
  },
  { 
    id: 2, 
    image: "/dreamy-hero-bg.jpg", 
    title: "TRUNG THU - Đèn hoa dưới ánh trăng 🌸", 
    sold: 227, 
    originalPrice: 69998, 
    price: 49999, 
    discount: 40,
    video: {
      id: 2,
      templateId: 2,
      headerTitle: "Video Hướng Dẫn Chi Tiết",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      captionTitle: "Hướng Dẫn Tuỳ Chỉnh & Thanh Toán",
      captionDesc: "Cách tạo thiệp online và quét mã QR thanh toán nhanh chóng",
      detailUrl: "/shop"
    }
  },
  { 
    id: 3, 
    image: "/dreamy-hero-bg.jpg", 
    title: "VIP - Món quà kỷ niệm, tình yêu, sinh nhật", 
    sold: 491, 
    originalPrice: 69998, 
    price: 49999, 
    discount: 40,
    video: {
      id: 3,
      templateId: 3,
      headerTitle: "Video Hướng Dẫn Sử Dụng Thẻ NFC",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      captionTitle: "Kích Hoạt & Cài Đặt Thẻ Quà Tặng NFC",
      captionDesc: "Chạm nhẹ điện thoại vào thẻ để mở thiệp chúc mừng cá nhân hoá 3D",
      detailUrl: "/shop"
    }
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
