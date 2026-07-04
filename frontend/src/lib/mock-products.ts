export type Category = "Beads" | "Charm" | "Bracelet String" | "Handmade Kit" | "Packaging";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  rating: number;
  description: string;
  matchScore: number;
}

const baseProducts: Omit<Product, 'matchScore'>[] = [
  {
    id: "p1",
    name: "Hạt cườm thuỷ tinh Miyuki Delica 11/0 - Trắng ngọc trai",
    price: 45000,
    image: "https://images.unsplash.com/photo-1596765793081-30c1e403d97d?q=80&w=600&auto=format&fit=crop",
    category: "Beads",
    rating: 4.8,
    description: "Hạt cườm Miyuki Nhật Bản chất lượng cao, đồng đều về kích thước. Thích hợp cho đính kết và đan vòng tay tinh tế."
  },
  {
    id: "p2",
    name: "Hạt đá pha lê Áo Bicone 4mm - Xanh biển mờ",
    price: 120000,
    image: "https://images.unsplash.com/photo-1605335198083-d51bbbc35d46?q=80&w=600&auto=format&fit=crop",
    category: "Beads",
    rating: 4.9,
    description: "Pha lê lấp lánh phản chiếu ánh sáng tuyệt đẹp. Tạo điểm nhấn sang trọng cho mọi thiết kế trang sức handmade."
  },
  {
    id: "p3",
    name: "Hạt gốm sứ họa tiết hoa cúc thủ công",
    price: 35000,
    image: "https://images.unsplash.com/photo-1618392120038-f9b3f3609340?q=80&w=600&auto=format&fit=crop",
    category: "Beads",
    rating: 4.5,
    description: "Hạt gốm được vẽ tay tỉ mỉ với họa tiết vintage. Lựa chọn hoàn hảo cho phong cách boho mộc mạc."
  },
  {
    id: "p4",
    name: "Charm bạc 925 - Lá phong mùa thu",
    price: 150000,
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=600&auto=format&fit=crop",
    category: "Charm",
    rating: 4.9,
    description: "Charm bạc thật 925 không hoen gỉ, thiết kế tinh xảo từng gân lá. Thêm phần ý nghĩa cho chiếc vòng tay của bạn."
  },
  {
    id: "p5",
    name: "Charm đồng thau nguyên khối - Trái tim vintage",
    price: 55000,
    image: "https://images.unsplash.com/photo-1629853965561-396568db30f3?q=80&w=600&auto=format&fit=crop",
    category: "Charm",
    rating: 4.7,
    description: "Mang nét hoài cổ với chất liệu đồng thau mộc. Càng đeo lâu càng lên màu cổ điển, cá tính."
  },
  {
    id: "p6",
    name: "Charm pha lê bọc kim loại ngọc trai",
    price: 85000,
    image: "https://images.unsplash.com/photo-1611082531065-925712f2ea45?q=80&w=600&auto=format&fit=crop",
    category: "Charm",
    rating: 4.6,
    description: "Sự kết hợp giữa sự thanh lịch của ngọc trai và viền kim loại phá cách. Phù hợp cho vòng tay và dây chuyền."
  },
  {
    id: "p7",
    name: "Dây dù lụa thắt vòng macramé 1mm - Set 5 cuộn pastel",
    price: 90000,
    image: "https://images.unsplash.com/photo-1598418579471-a4ed5e640d2f?q=80&w=600&auto=format&fit=crop",
    category: "Bracelet String",
    rating: 4.8,
    description: "Sợi dù mềm mại, không xù lông khi thắt. Màu pastel ngọt ngào dễ phối hợp cho các mẫu vòng macramé."
  },
  {
    id: "p8",
    name: "Dây cước thun trong suốt xâu vòng 0.8mm",
    price: 25000,
    image: "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?q=80&w=600&auto=format&fit=crop",
    category: "Bracelet String",
    rating: 4.4,
    description: "Cước thun co giãn tốt, dai và bền bỉ. Sản phẩm cơ bản không thể thiếu để xâu vòng tay đá phong thủy."
  },
  {
    id: "p9",
    name: "Dây da sáp bện vintage 2mm",
    price: 40000,
    image: "https://images.unsplash.com/photo-1632512686899-73e0fc6cf7b7?q=80&w=600&auto=format&fit=crop",
    category: "Bracelet String",
    rating: 4.5,
    description: "Dây da thật xử lý sáp chống thấm nước nhẹ. Hoàn hảo cho các thiết kế trang sức nam tính hoặc mộc mạc."
  },
  {
    id: "p10",
    name: "Kit làm hoa tulip bằng kẽm nhung (Màu hồng đào)",
    price: 185000,
    image: "https://images.unsplash.com/photo-1613143427958-3860c2262d55?q=80&w=600&auto=format&fit=crop",
    category: "Handmade Kit",
    rating: 4.9,
    description: "Trọn bộ nguyên liệu gồm kẽm nhung, keo, lá và giấy gói. Thành phẩm là một bó hoa tulip mềm mại lưu giữ mãi mãi."
  },
  {
    id: "p11",
    name: "Kit tự thắt vòng tay Macrame cơ bản cho người mới",
    price: 120000,
    image: "https://images.unsplash.com/photo-1596230467571-002d08a0d9f4?q=80&w=600&auto=format&fit=crop",
    category: "Handmade Kit",
    rating: 4.7,
    description: "Kèm bảng hướng dẫn chi tiết và mã QR video. Giúp bạn dễ dàng hoàn thành chiếc vòng tay thắt nút đầu tiên."
  },
  {
    id: "p12",
    name: "Bộ làm nến thơm hoa khô thư giãn",
    price: 250000,
    image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=600&auto=format&fit=crop",
    category: "Handmade Kit",
    rating: 5.0,
    description: "Bao gồm sáp đậu nành, tinh dầu thiên nhiên, hoa khô trang trí và cốc nến. Trải nghiệm làm nến thư thái tại nhà."
  },
  {
    id: "p13",
    name: "Hộp quà Kraft nắp gài vintage",
    price: 15000,
    image: "https://images.unsplash.com/photo-1592842415174-84617a2fb455?q=80&w=600&auto=format&fit=crop",
    category: "Packaging",
    rating: 4.6,
    description: "Giấy kraft định lượng dày dặn, thân thiện với môi trường. Mang lại vẻ đẹp tối giản và tinh tế cho món quà."
  },
  {
    id: "p14",
    name: "Ruy băng voan xé tua rua phong cách thơ mộng",
    price: 35000,
    image: "https://images.unsplash.com/photo-1627883256038-0402e604fdb8?q=80&w=600&auto=format&fit=crop",
    category: "Packaging",
    rating: 4.8,
    description: "Chất liệu voan nhẹ nhàng, bay bổng với viền xé tự nhiên. Tạo điểm nhấn mềm mại khi thắt nơ hộp quà."
  },
  {
    id: "p15",
    name: "Set tem dán niêm phong 'Handmade with love'",
    price: 20000,
    image: "https://images.unsplash.com/photo-1589363539823-380d0dcb7689?q=80&w=600&auto=format&fit=crop",
    category: "Packaging",
    rating: 4.5,
    description: "Bộ 50 tem dán với font chữ viết tay dễ thương. Chi tiết nhỏ thể hiện tâm huyết của người làm thủ công."
  },
  {
    id: "p16",
    name: "Hạt chữ cái Acrylic pastel mix màu",
    price: 45000,
    image: "https://images.unsplash.com/photo-1590483868285-d72b22ec313e?q=80&w=600&auto=format&fit=crop",
    category: "Beads",
    rating: 4.7,
    description: "Hạt nhựa acrylic nhẹ, in chữ cái rõ nét. Thích hợp xâu vòng tay mang thông điệp ý nghĩa riêng."
  },
  {
    id: "p17",
    name: "Charm gấu dâu Resin",
    price: 15000,
    image: "https://images.unsplash.com/photo-1596765793081-30c1e403d97d?q=80&w=600&auto=format&fit=crop",
    category: "Charm",
    rating: 4.6,
    description: "Charm resin đúc hình chú gấu ôm trái dâu ngọt ngào. Kích thước nhỏ nhắn cho các thiết kế kẹo ngọt."
  },
  {
    id: "p18",
    name: "Giấy rơm lót hộp quà chống sốc - Mix màu pastel",
    price: 18000,
    image: "https://images.unsplash.com/photo-1592842415174-84617a2fb455?q=80&w=600&auto=format&fit=crop",
    category: "Packaging",
    rating: 4.8,
    description: "Giấy vụn lót hộp không chỉ bảo vệ sản phẩm handmade bên trong mà còn tăng tính thẩm mỹ khi mở quà."
  }
];

// Tạo điểm số matchScore ngẫu nhiên từ 85 - 99% cho có cảm giác AI gợi ý
export const mockProducts: Product[] = baseProducts.map((p, index) => ({
  ...p,
  matchScore: 85 + (index * 7) % 15 // Giả lập điểm số từ 85-99
}));
