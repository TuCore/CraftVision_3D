class MockProduct {
  final String id;
  final String name;
  final String imageUrl;
  final double price;
  final String category;
  final String description;

  const MockProduct({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.price,
    required this.category,
    required this.description,
  });
}

class MockData {
  static const List<MockProduct> products = [
    MockProduct(
      id: 'p1',
      name: 'Crystal Rose 3D',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
      price: 499000,
      category: 'Kỷ niệm',
      description: 'Khối pha lê khắc 3D hoa hồng tinh xảo, quà tặng hoàn hảo cho ngày kỷ niệm. Có thể quét NFC để xem thiệp AR.',
    ),
    MockProduct(
      id: 'p2',
      name: 'Khối Acrylic Gia Đình',
      imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop',
      price: 550000,
      category: 'Gia đình',
      description: 'Chuyển ảnh gia đình thành mô hình 3D khối acrylic trong suốt. Độ bền cao, bảo hành trọn đời.',
    ),
    MockProduct(
      id: 'p3',
      name: 'Móc khoá Corgi 3D',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop',
      price: 120000,
      category: 'Phụ kiện',
      description: 'Móc khoá in 3D hình chú chó Corgi đáng yêu, chất liệu nhựa resin an toàn.',
    ),
    MockProduct(
      id: 'p4',
      name: 'Hộp Đèn Cung Hoàng Đạo',
      imageUrl: 'https://images.unsplash.com/photo-1506744626753-1fa7673e01f5?q=80&w=400&auto=format&fit=crop',
      price: 350000,
      category: 'Sinh nhật',
      description: 'Hộp đèn led 3D với 12 cung hoàng đạo. Quà tặng sinh nhật tuyệt vời.',
    ),
  ];

  static const List<String> categories = ['Tất cả', 'Móc khóa', 'Hoa kẽm nhung', 'Trang sức', 'Trang trí'];
}
