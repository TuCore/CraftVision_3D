class ProductViewModel {
  const ProductViewModel({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.price,
    required this.category,
    required this.description,
    this.images = const [],
  });

  factory ProductViewModel.fromJson(Map<String, dynamic> json) {
    final images = (json['images'] as List<dynamic>? ?? const [])
        .map((e) => '$e')
        .toList();
    return ProductViewModel(
      id: '${json['id'] ?? ''}',
      name: '${json['name'] ?? 'Sản phẩm'}',
      imageUrl:
          '${json['thumbnailUrl'] ?? json['sampleImageUrl'] ?? (images.isEmpty ? '' : images.first)}',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      category: '${json['categoryName'] ?? ''}',
      description: '${json['description'] ?? ''}',
      images: images,
    );
  }

  final String id;
  final String name;
  final String imageUrl;
  final double price;
  final String category;
  final String description;
  final List<String> images;
}
