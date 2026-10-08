// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductModel _$ProductModelFromJson(Map<String, dynamic> json) => ProductModel(
  id: json['id'] as String,
  name: json['name'] as String,
  sku: json['sku'] as String?,
  description: json['description'] as String?,
  price: (json['price'] as num).toDouble(),
  stock: (json['stock'] as num).toInt(),
  thumbnailUrl: json['thumbnailUrl'] as String?,
  sampleImageUrl: json['sampleImageUrl'] as String?,
  images:
      (json['images'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  productType: json['productType'] as String,
  supportsNfc: json['supportsNfc'] as bool,
  estimatedProductionDays: (json['estimatedProductionDays'] as num?)?.toInt(),
  categoryName: json['categoryName'] as String?,
  isComingSoon: json['isComingSoon'] as bool,
);

Map<String, dynamic> _$ProductModelToJson(ProductModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'sku': instance.sku,
      'description': instance.description,
      'price': instance.price,
      'stock': instance.stock,
      'thumbnailUrl': instance.thumbnailUrl,
      'sampleImageUrl': instance.sampleImageUrl,
      'images': instance.images,
      'productType': instance.productType,
      'supportsNfc': instance.supportsNfc,
      'estimatedProductionDays': instance.estimatedProductionDays,
      'categoryName': instance.categoryName,
      'isComingSoon': instance.isComingSoon,
    };
