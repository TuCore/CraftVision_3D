import 'package:json_annotation/json_annotation.dart';

part 'product_model.g.dart';

@JsonSerializable()
class ProductModel {
  final String id;
  final String name;
  final String? sku;
  final String? description;
  final double price;
  final int stock;
  
  final String? thumbnailUrl;
  final String? sampleImageUrl;
  final List<String> images;
  
  final String productType;
  final bool supportsNfc;
  final int? estimatedProductionDays;
  final String? categoryName;
  final bool isComingSoon;

  ProductModel({
    required this.id,
    required this.name,
    this.sku,
    this.description,
    required this.price,
    required this.stock,
    this.thumbnailUrl,
    this.sampleImageUrl,
    this.images = const [],
    required this.productType,
    required this.supportsNfc,
    this.estimatedProductionDays,
    this.categoryName,
    required this.isComingSoon,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) => _$ProductModelFromJson(json);
  Map<String, dynamic> toJson() => _$ProductModelToJson(this);

  // Helper method to get the primary image URL
  String get primaryImageUrl {
    if (thumbnailUrl != null && thumbnailUrl!.isNotEmpty) {
      return thumbnailUrl!;
    }
    if (sampleImageUrl != null && sampleImageUrl!.isNotEmpty) {
      final urls = sampleImageUrl!.split(',');
      if (urls.isNotEmpty) return urls.first.trim();
    }
    if (images.isNotEmpty) {
      return images.first;
    }
    return '';
  }

  List<String> get allImageUrls {
    final List<String> urls = [];
    if (thumbnailUrl != null && thumbnailUrl!.isNotEmpty) {
      urls.add(thumbnailUrl!);
    }
    if (sampleImageUrl != null && sampleImageUrl!.isNotEmpty) {
      urls.addAll(sampleImageUrl!.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty));
    }
    urls.addAll(images);
    
    if (urls.isEmpty) {
      // Return a placeholder or leave empty
      urls.add('https://placehold.co/400x600/png');
    }
    return urls.toSet().toList(); // Remove duplicates
  }
}
