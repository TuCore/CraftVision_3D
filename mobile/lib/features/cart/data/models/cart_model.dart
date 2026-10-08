import 'package:json_annotation/json_annotation.dart';

part 'cart_model.g.dart';

@JsonSerializable()
class CartModel {
  final String id;
  final String userId;
  final List<CartItemModel> items;

  CartModel({
    required this.id,
    required this.userId,
    required this.items,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) => _$CartModelFromJson(json);
  Map<String, dynamic> toJson() => _$CartModelToJson(this);

  double get totalPrice {
    return items.fold(0, (sum, item) => sum + (item.price * item.quantity));
  }
}

@JsonSerializable()
class CartItemModel {
  final String id;
  final String productId;
  final String productName;
  final String productImageUrl;
  final double price;
  final int quantity;
  final String? selectedOptions;

  CartItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productImageUrl,
    required this.price,
    required this.quantity,
    this.selectedOptions,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) => _$CartItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$CartItemModelToJson(this);
}
