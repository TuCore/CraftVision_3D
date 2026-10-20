import 'package:json_annotation/json_annotation.dart';
import '../../../shop/data/models/product_model.dart';

part 'wishlist_model.g.dart';

@JsonSerializable()
class WishlistModel {
  final String id;
  final String userId;
  final List<WishlistItemModel> items;

  WishlistModel({
    required this.id,
    required this.userId,
    required this.items,
  });

  factory WishlistModel.fromJson(Map<String, dynamic> json) => _$WishlistModelFromJson(json);
  Map<String, dynamic> toJson() => _$WishlistModelToJson(this);
}

@JsonSerializable()
class WishlistItemModel {
  final String id;
  final String productId;
  final ProductModel product;
  
  WishlistItemModel({
    required this.id,
    required this.productId,
    required this.product,
  });

  factory WishlistItemModel.fromJson(Map<String, dynamic> json) => _$WishlistItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$WishlistItemModelToJson(this);
}
