class ProductModel {
  final String id;
  final String name;
  final String imageUrl;
  final double price;
  final String category;
  final String description;

  const ProductModel({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.price,
    required this.category,
    required this.description,
  });
}

class ShopLocalDataSource {
  static const List<ProductModel> mockProducts = [
    ProductModel(
      id: 'p1',
      name: 'Crystal Rose 3D',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
      price: 499000,
      category: 'Kỷ niệm',
      description: 'Khối pha lê khắc 3D hoa hồng tinh xảo, quà tặng hoàn hảo cho ngày kỷ niệm. Có thể quét NFC để xem thiệp AR.',
    ),
    ProductModel(
      id: 'p2',
      name: 'Khối Acrylic Gia Đình',
      imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop',
      price: 550000,
      category: 'Gia đình',
      description: 'Chuyển ảnh gia đình thành mô hình 3D khối acrylic trong suốt. Độ bền cao, bảo hành trọn đời.',
    ),
    ProductModel(
      id: 'p3',
      name: 'Móc khoá Corgi 3D',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop',
      price: 120000,
      category: 'Phụ kiện',
      description: 'Móc khoá in 3D hình chú chó Corgi đáng yêu, chất liệu nhựa resin an toàn.',
    ),
    ProductModel(
      id: 'p4',
      name: 'Hộp Đèn Cung Hoàng Đạo',
      imageUrl: 'https://images.unsplash.com/photo-1506744626753-1fa7673e01f5?q=80&w=400&auto=format&fit=crop',
      price: 350000,
      category: 'Sinh nhật',
      description: 'Hộp đèn led 3D với 12 cung hoàng đạo. Quà tặng sinh nhật tuyệt vời.',
    ),
  ];

  static const List<String> mockCategories = ['Tất cả', 'Sinh nhật', 'Kỷ niệm', 'Gia đình', 'Phụ kiện'];

  Future<List<ProductModel>> getProducts() async {
    // Giả lập network delay
    await Future.delayed(const Duration(milliseconds: 500));
    return mockProducts;
  }

  Future<List<String>> getCategories() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return mockCategories;
  }

  Future<ProductModel> getProductById(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return mockProducts.firstWhere(
      (p) => p.id == id,
      orElse: () => mockProducts.first,
    );
  }
}
