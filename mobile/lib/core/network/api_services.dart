import '../../features/chat/data/services/ai_chat_service.dart';
import '../../features/auth/data/services/auth_service.dart';
import '../../features/gift_reveal/data/services/gift_reveal_service.dart';
import '../../features/gift_reveal/data/services/nfc_service.dart';
import '../../features/manifest/data/services/manifest_service.dart';
import '../../features/order/data/services/order_service.dart';
import '../../features/profile/data/services/address_service.dart';
import '../../features/profile/data/services/user_service.dart';
import '../../features/shop/data/services/product_category_service.dart';
import '../../features/shop/data/services/product_service.dart';
import '../../features/shop/data/services/review_service.dart';
import 'api_client.dart';
import 'upload_service.dart';

class ApiServices {
  ApiServices._(this.client)
    : auth = AuthService(client),
      products = ProductService(client),
      productCategories = ProductCategoryService(client),
      user = UserService(client),
      addresses = AddressService(client),
      orders = OrderService(client),
      reviews = ReviewService(client),
      uploads = UploadService(client),
      aiChat = AiChatService(client),
      giftReveal = GiftRevealService(client),
      nfc = NfcService(client),
      manifest = ManifestService(client);

  final ApiClient client;
  final AuthService auth;
  final ProductService products;
  final ProductCategoryService productCategories;
  final UserService user;
  final AddressService addresses;
  final OrderService orders;
  final ReviewService reviews;
  final UploadService uploads;
  final AiChatService aiChat;
  final GiftRevealService giftReveal;
  final NfcService nfc;
  final ManifestService manifest;

  static Future<ApiServices> create({String? baseUrl}) async =>
      ApiServices._(await ApiClient.create(baseUrl: baseUrl));

  void close() => client.close();
}
