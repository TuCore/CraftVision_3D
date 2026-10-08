// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_category_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductCategoryModel _$ProductCategoryModelFromJson(
  Map<String, dynamic> json,
) => ProductCategoryModel(
  id: json['id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String?,
  description: json['description'] as String?,
  icon: json['icon'] as String?,
  displayOrder: (json['displayOrder'] as num?)?.toInt(),
);

Map<String, dynamic> _$ProductCategoryModelToJson(
  ProductCategoryModel instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'description': instance.description,
  'icon': instance.icon,
  'displayOrder': instance.displayOrder,
};
