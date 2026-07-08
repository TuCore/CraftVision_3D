export type Category = "Móc khoá" | "Vòng tay" | "Dây chuyền" | "Charm" | "Đồ trang trí";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  rating: number;
  description: string;
  matchScore: number;
}

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Charm hạt cơ bản",
    price: 35000,
    category: "Charm",
    image: "/image/charm.jpg",
    rating: 4.8,
    description: "Charm hạt nhựa cơ bản dễ thương, thích hợp để xỏ vòng tay hoặc vòng cổ tự làm.",
    matchScore: 95,
  },
  {
    id: "p2",
    name: "Charm đất sét nặn",
    price: 35000,
    category: "Charm",
    image: "/image/charmdatnang.jpg",
    rating: 4.9,
    description: "Charm làm từ đất sét tự nặn tỉ mỉ, độc đáo và đầy màu sắc.",
    matchScore: 92,
  },
  {
    id: "p3",
    name: "Charm nhựa trong suốt",
    price: 35000,
    category: "Charm",
    image: "/image/charmnhua.jpg",
    rating: 4.7,
    description: "Charm nhựa trong bắt sáng cực tốt, điểm nhấn lấp lánh cho món trang sức của bạn.",
    matchScore: 90,
  },
  {
    id: "p4",
    name: "Móc khóa nhựa dễ thương",
    price: 35000,
    category: "Móc khoá",
    image: "/image/mockhoa2.jpg",
    rating: 4.6,
    description: "Móc khóa nhựa in hình các nhân vật đáng yêu, món quà nhỏ mang nhiều ý nghĩa.",
    matchScore: 88,
  },
  {
    id: "p5",
    name: "Móc khóa len gấu",
    price: 65000,
    category: "Móc khoá",
    image: "/image/mockhoagau.jpg",
    rating: 5.0,
    description: "Móc khoá đan len thủ công hình gấu cực kỳ mềm mại, chi tiết sắc sảo.",
    matchScore: 98,
  },
  {
    id: "p6",
    name: "Móc khóa len hình thú",
    price: 65000,
    category: "Móc khoá",
    image: "/image/moclen.jpg",
    rating: 4.9,
    description: "Móc khoá len hình thú đa dạng, cực kỳ ngộ nghĩnh dùng để treo cặp balo.",
    matchScore: 94,
  },
  {
    id: "p7",
    name: "Dây chuyền đính charm",
    price: 120000,
    category: "Dây chuyền",
    image: "/image/vongco.jpg",
    rating: 4.8,
    description: "Dây chuyền thanh lịch với các charm nhỏ nhắn, tôn lên vẻ nữ tính dịu dàng.",
    matchScore: 96,
  },
  {
    id: "p8",
    name: "Vòng tay chuỗi hạt",
    price: 100000,
    category: "Vòng tay",
    image: "/image/vongtay.jpg",
    rating: 4.9,
    description: "Vòng tay chuỗi hạt màu pastel thủ công, phối màu cực kỳ dễ phối đồ.",
    matchScore: 97,
  },
  {
    id: "p9",
    name: "Vòng tay chuỗi hạt màu sắc",
    price: 100000,
    category: "Vòng tay",
    image: "/image/vongtay3.jpg",
    rating: 4.7,
    description: "Vòng tay xỏ hạt kết hợp nhiều kiểu dáng lạ mắt, mang lại cá tính riêng.",
    matchScore: 91,
  },
  {
    id: "p10",
    name: "Vòng tay hạt dễ thương",
    price: 100000,
    category: "Vòng tay",
    image: "/image/vongtaydethuong.jpg",
    rating: 5.0,
    description: "Vòng tay được làm từ các loại hạt cườm ngộ nghĩnh, phù hợp với phong cách kẹo ngọt.",
    matchScore: 99,
  },
  {
    id: "p11",
    name: "Vòng tay kim loại cá tính",
    price: 150000,
    category: "Vòng tay",
    image: "/image/vongtaysat.jpg",
    rating: 4.8,
    description: "Vòng tay kim loại phong cách năng động, không gỉ sét, phù hợp nam nữ.",
    matchScore: 93,
  }
];
