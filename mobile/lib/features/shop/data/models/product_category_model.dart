import 'package:json_annotation/json_annotation.dart';

part 'product_category_model.g.dart';

@JsonSerializable()
class ProductCategoryModel {
  final String id;
  final String name;
  final String? slug;
  final String? description;
  final String? icon;
  final int? displayOrder;

  ProductCategoryModel({
    required this.id,
    required this.name,
    this.slug,
    this.description,
    this.icon,
    this.displayOrder,
  });

  factory ProductCategoryModel.fromJson(Map<String, dynamic> json) => _$ProductCategoryModelFromJson(json);
  Map<String, dynamic> toJson() => _$ProductCategoryModelToJson(this);
}
