import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/datasources/shop_remote_datasource.dart';
import '../../data/repositories/shop_repository.dart';
import '../../data/models/product_model.dart';
import '../../data/models/product_category_model.dart';

final shopRemoteDataSourceProvider = Provider<ShopRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return ShopRemoteDataSource(dio);
});

final shopRepositoryProvider = Provider<ShopRepository>((ref) {
  final remote = ref.watch(shopRemoteDataSourceProvider);
  return ShopRepository(remote);
});

final categoriesProvider = FutureProvider<List<ProductCategoryModel>>((ref) async {
  final repository = ref.watch(shopRepositoryProvider);
  return await repository.getCategories();
});

final popularProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final repository = ref.watch(shopRepositoryProvider);
  return await repository.getProducts(sortBy: 'popular', limit: 6);
});

final newArrivalsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final repository = ref.watch(shopRepositoryProvider);
  return await repository.getProducts(sortBy: 'newest', limit: 6);
});

final productsProvider = FutureProvider<List<ProductModel>>((ref) async {
  final repository = ref.watch(shopRepositoryProvider);
  return await repository.getProducts();
});

final productDetailProvider = FutureProvider.family<ProductModel, String>((ref, id) async {
  final repository = ref.watch(shopRepositoryProvider);
  return await repository.getProductDetail(id);
});
