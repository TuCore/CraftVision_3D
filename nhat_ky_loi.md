# BÁO CÁO TỔNG HỢP LỖI & GIẢI PHÁP - ỨNG DỤNG DI ĐỘNG (CRAFTVISION 3D MOBILE APP)

Tài liệu này ghi nhận và chuẩn hóa toàn bộ các lỗi phát sinh, điểm nghẽn hiệu năng và yêu cầu điều chỉnh giao diện/chức năng trên **phân hệ Ứng dụng di động (Mobile App Flutter)** cùng luồng tích hợp với Backend .NET.

> **Quy tắc làm việc:** Toàn bộ báo cáo tập trung 100% vào lỗi của ứng dụng Mobile (không ghi lỗi của phân hệ Web). Mọi vấn đề được phân tích chi tiết gồm hiện tượng, nguyên nhân gốc rễ và giải pháp xử lý. Tuyệt đối không tự ý chỉnh sửa mã nguồn hay commit/push lên Git khi chưa có chỉ thị từ người dùng.

---

## 1. Lỗi đồng bộ Kho hàng & Giỏ hàng theo thời gian thực trên Mobile (Inventory & Cart Reservation)
- **Hiện tượng:**
  - Khi người dùng thêm sản phẩm vào giỏ hàng trên ứng dụng di động, số lượng tồn kho chưa được trừ tạm thời theo thời gian thực.
  - Khi giảm số lượng hoặc xóa sản phẩm khỏi giỏ, kho không được hoàn trả lại số lượng tương ứng.
  - Khi sản phẩm chỉ còn 1 cái cuối cùng và đã có người cho vào giỏ, người dùng khác vào xem chi tiết sản phẩm trên app vẫn thấy còn hàng thay vì hiển thị "Tạm hết hàng".
  - Khi số lượng trong giỏ hàng đã chạm ngưỡng tồn kho tối đa, nút cộng (+) trong giỏ hàng vẫn cho phép bấm tiếp, gây sai lệch đơn hàng.
- **Nguyên nhân:**
  - Logic giỏ hàng trên app chỉ lưu biến tạm cục bộ, chưa tích hợp API giữ hàng (`reserve inventory`) và chưa liên kết với trường `stockQuantity` từ Backend database.
  - Nút tăng số lượng chưa có điều kiện kiểm tra ngưỡng chặn `quantity >= stockQuantity`.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - **Khóa nút cộng:** Ràng buộc điều kiện `onPressed: item.quantity >= item.stockQuantity ? null : () => incrementQuantity()` và hiển thị SnackBar cảnh báo khi người dùng cố tình thêm vượt số lượng tồn kho.
  - **Cơ chế giữ hàng tạm thời:** Khi sản phẩm được cho vào giỏ, trừ tạm số lượng hiển thị (`availableQuantity = stockQuantity - reservedQuantity`). Nếu `availableQuantity <= 0`, hiển thị trạng thái "Tạm hết hàng" trên thẻ sản phẩm.
  - **Hoàn trả kho:** Khi xóa sản phẩm khỏi giỏ hàng hoặc phiên mua sắm hết hạn (timeout), tự động giải phóng số lượng hàng tạm giữ trở lại kho.

---

## 2. Lỗi số lượng sản phẩm trong giỏ bị lệch khi thêm nhiều món trên Mobile (Cart Quantity Mismatch)
- **Hiện tượng:** Kho có sẵn 5 sản phẩm, người dùng chọn thêm 4 sản phẩm từ màn hình chi tiết sản phẩm vào giỏ hàng, nhưng khi mở màn hình giỏ hàng ra kiểm tra thì chỉ thấy có 2 sản phẩm.
- **Nguyên nhân:** Hàm xử lý thêm vào giỏ hàng trên mobile bị giới hạn bởi giá trị hardcode hoặc hàm cập nhật số lượng bị ghi đè (overwrite) thay vì cộng dồn, hoặc bị chặn bởi một điều kiện kiểm tra tồn kho ngầm định sai lệch.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):** Rà soát và chuẩn hóa hàm thêm vào giỏ hàng trong State Notifier của Mobile, đảm bảo số lượng thêm mới được cộng dồn chính xác (`newQty = currentQty + addedQty`) và chỉ giới hạn khi tổng số lượng vượt quá `stockQuantity`.

---

## 3. Lỗi giá sản phẩm bị mất đồng lẻ và số lượng hiển thị sai (Float / Rounding Precision)
- **Hiện tượng:** Giá sản phẩm trên mobile nhập vào là 35.000đ nhưng khi hiển thị ra giao diện lại bị hụt mất 3 đồng (chỉ còn 34.997đ), đồng thời số lượng sản phẩm cũng bị giảm một khoảng.
- **Nguyên nhân:** Xảy ra sai số dấu phẩy động (floating-point precision error) khi thực hiện các phép tính chiết khấu hoặc chuyển đổi đơn vị bằng kiểu dữ liệu `double` trong Dart/Flutter kết hợp với định dạng số thực từ C#/.NET.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Phía Mobile Flutter: Sử dụng kiểu số nguyên `int` (lưu theo đơn vị VNĐ) cho giá tiền hoặc sử dụng `NumberFormat.currency(locale: 'vi_VN', symbol: 'đ')` từ gói `intl` để định dạng hiển thị trực tiếp từ giá trị số nguyên nguyên bản, không dùng các phép chia số thực làm tròn.
  - Phía Backend: Đảm bảo toàn bộ các trường giá tiền được định nghĩa bằng `decimal` hoặc `long`.

---

## 4. Lỗi mã QR thanh toán PayOS trên màn hình Thanh toán Mobile chỉ là ảnh tĩnh & hết hạn
- **Hiện tượng:**
  - Trên màn hình thanh toán đơn hàng mobile, mã QR thanh toán chuyển khoản PayOS chỉ hiển thị như một hình ảnh tĩnh, không có nút mở app ngân hàng tự động (deep link VietQR).
  - Khách hàng không chuyển tiền ngay mà quay lại sau 1-3 ngày thì mã QR đã hết hạn (TTL expired), không thể quét hay chuyển tiền được nữa.
- **Nguyên nhân:**
  - Cổng PayOS quy định thời gian sống (TTL) cho mỗi link thanh toán. Sau thời gian này, link tự động hủy nhưng đơn hàng trên mobile vẫn giữ nguyên link thanh toán cũ đã chết.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - **Trên Mobile App:** Khi kiểm tra đơn hàng ở trạng thái `Pending` mà link thanh toán đã hết hạn, hiển thị nút **"Tạo lại mã thanh toán QR"**.
  - Bổ sung nút bấm **"Mở ứng dụng Ngân hàng"** (sử dụng URL scheme `vietqr://` hoặc mở link thanh toán PayOS qua `url_launcher`) để người dùng thanh toán tiện lợi ngay trên điện thoại.

---

## 5. Lỗi hiển thị ảnh thiệp đính kèm khi đơn hàng không có thiệp trên Mobile (Card Image Fallback)
- **Hiện tượng:** Với những đơn hàng khách hàng không chọn gửi kèm thiệp chúc mừng, giao diện chi tiết đơn hàng trên mobile ([order_detail_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/order/presentation/screens/order_detail_screen.dart)) vẫn cố gắng tải ảnh thiệp, dẫn đến hiển thị khung ảnh vỡ, placeholder trống hoặc lỗi console tải ảnh không tồn tại.
- **Nguyên nhân:** Widget chi tiết đơn hàng chưa có điều kiện kiểm tra xem đơn hàng có dữ liệu thiệp (`giftCard`) hay không trước khi render ảnh.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):** Bổ sung điều kiện render có điều kiện (`if (order['gift'] != null && '${order['gift']['previewImageUrl'] ?? ''}'.isNotEmpty)`). Nếu đơn hàng không có thiệp thì ẩn hoàn toàn khu vực hiển thị ảnh thiệp, hiển thị dòng thông báo nhẹ: *"Đơn hàng không kèm thiệp chúc mừng"*.

---

## 6. Lỗi thừa Icon xe đẩy 🛒 trong thông báo Toast / SnackBar trên Mobile
- **Hiện tượng:** Khi người dùng thêm sản phẩm vào giỏ hàng thành công trên mobile, popup SnackBar thông báo hiện lên kèm icon xe đẩy 🛒 (`Đã thêm vào giỏ hàng 🛒`) gây rối mắt, giao diện không được tinh giản và sang trọng.
- **Nguyên nhân:** Chuỗi ký tự thông báo trong hàm `_addToCart` chứa sẵn ký tự emoji `🛒`.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):** Xóa bỏ ký tự emoji `🛒` khỏi chuỗi thông báo SnackBar, sử dụng thiết kế SnackBar chuẩn của app với icon tinh gọn `Icons.check_circle_outline` màu trắng trên nền tối nhã nhặn.

---

## 7. Lỗi màu chữ nút Đăng nhập trên màn hình Xác thực Mobile khó đọc
- **Hiện tượng:** Nút "Đăng nhập" và "Tiếp tục" tại màn hình xác thực Mobile ([auth_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/auth/presentation/screens/auth_screen.dart)) có màu chữ tối hoặc xám, bị chìm vào nền nút màu coral, gây khó nhìn và giảm tính thẩm mỹ.
- **Nguyên nhân:** Component `CvButton` ([cv_button.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/core/widgets/cv_button.dart)) khi ở trạng thái mặc định sử dụng màu chữ `neutral600` (màu nâu xám), chưa được ép định dạng màu trắng tương phản cao trên nền màu chính (Primary Coral).
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):** Trong `auth_screen.dart`, bổ sung thuộc tính `customForegroundColor: AppColors.white` cho `CvButton` ở cả bước nhập Email và bước nhập Password để chữ luôn hiển thị màu trắng rõ nét.

---

## 8. Lỗi cấu hình IP kết nối Mobile: `POST http://10.0.2.2:5000/api/auth/login net::ERR_CONNECTION_TIMED_OUT`
- **Hiện tượng:** Khi chạy app Flutter trên trình duyệt Chrome/Edge hoặc máy tính Windows, thực hiện đăng nhập thì request bị treo và văng lỗi timeout `ERR_CONNECTION_TIMED_OUT`.
- **Nguyên nhân:**
  - File [api_client.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/core/network/api_client.dart#L27) hardcode địa chỉ mặc định `http://10.0.2.2:5000/api`. Địa chỉ `10.0.2.2` là IP loopback ảo do Android Emulator tạo riêng để trỏ về máy host. Trình duyệt Web và máy tính Desktop không thể định tuyến tới IP này.
  - Backend .NET thực tế đang chạy trên cổng **5192** (theo `launchSettings.json`), chứ không phải cổng 5000.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):** Cập nhật `api_client.dart` sử dụng logic tự động nhận diện môi trường:
  - Nếu chạy trên Web (`kIsWeb`) hoặc Desktop: Sử dụng `http://localhost:5192/api`.
  - Nếu chạy trên Android Emulator: Sử dụng `http://10.0.2.2:5192/api`.
  - Hỗ trợ biến môi trường linh hoạt qua `--dart-define=API_BASE_URL=...`.

---

## 9. Lỗi tải ảnh Cloudinary trên Mobile: 400 Bad Request / 404 Not Found do chuỗi URL nối bằng dấu phẩy
- **Hiện tượng & Log thực tế:**
  - Console mobile dập lỗi liên tục khi tải danh sách sản phẩm:
    ```
    dnrzhdbs3ni01pmssudo.jpg:1 GET https://res.cloudinary.com/.../iqqx3voref5kypu01fgo.jpg,https://res.cloudinary.com/.../zbu2mofzbprqueowfzoj.jpg 400 (Bad Request)
    ```
  - Stack trace xuất phát từ: `cached_network_image` khi đọc chuỗi ảnh từ model.
- **Nguyên nhân:** Trong cơ sở dữ liệu PostgreSQL, các sản phẩm có nhiều ảnh được lưu dưới dạng một chuỗi các URL nối với nhau bằng dấu phẩy. Khi model `ProductViewModel.fromJson` nhận chuỗi này, ứng dụng truyền nguyên chuỗi vào `CachedNetworkImage`, khiến toàn bộ chuỗi bị xem như một URL duy nhất không hợp lệ.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Trong `ProductViewModel.fromJson`: Sử dụng hàm `.split(',')` để bóc tách chuỗi URL. Lấy đường link hợp lệ đầu tiên gán cho `imageUrl` đại diện và đưa danh sách các link còn lại vào mảng `images`.
  - Trong [cv_product_card.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/core/widgets/cv_product_card.dart): Bổ sung `errorWidget` hiển thị ảnh placeholder thay thế khi link ảnh bị lỗi, tránh văng lỗi crash ứng dụng.

---

## 10. Lỗi scale tỷ lệ thẻ sản phẩm & tràn viền trên Mobile: `A RenderFlex overflowed by 17 pixels on the bottom`
- **Hiện tượng & Ảnh chụp thực tế:**
  - Tại màn hình Shop trên mobile ([shop_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/screens/shop_screen.dart)), dưới thẻ sản phẩm xuất hiện dải sọc chéo vàng đen cảnh báo:
    `BOTTOM OVERFLOWED BY 17 PIXELS`
  - Dải cảnh báo này đè trực tiếp lên dòng giá tiền `"0000 đ"`, làm biến dạng bố cục thẻ sản phẩm.
- **Log crash chi tiết từ Flutter Rendering:**
  ```
  The following assertion was thrown during layout:
  A RenderFlex overflowed by 17 pixels on the bottom.
  The relevant error-causing widget was: Column:file:///mobile/lib/core/widgets/cv_product_card.dart:37:14
  constraints: BoxConstraints(w=172.0, h=229.3), size: Size(172.0, 229.3)
  ```
- **Nguyên nhân gốc rễ:**
  - Lưới `GridView.builder` trong `shop_screen.dart` đặt `childAspectRatio: 0.75`, giới hạn chiều cao mỗi thẻ tối đa là `172 / 0.75 = 229.3px`.
  - Tuy nhiên, tổng chiều cao các phần tử bên trong `CvProductCard` (ảnh vuông 172px + padding 12px + text tên sản phẩm 40px + giá tiền 22px) là 246.3px.
  - Độ lệch: $246.3 - 229.3 = 17\text{px}$, dẫn đến lỗi tràn viền.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Điều chỉnh `childAspectRatio` từ `0.75` xuống `0.67` (chiều cao tăng lên $256.7\text{px}$, đủ không gian cho toàn bộ nội dung).
  - Đặt `maxLines: 1` và `overflow: TextOverflow.ellipsis` cho tên sản phẩm trong `CvProductCard`.

---

## 11. Bão lỗi `401 Unauthorized` khi người dùng duyệt Mobile ở chế độ Khách (Guest Mode)
- **Hiện tượng & Log thực tế:**
  - Khi người dùng mở app với vai trò khách vãng lai (chưa đăng nhập), console dập lỗi 401 liên tục:
    ```
    browser_client.dart:83 GET http://localhost:5192/api/chat/sessions 401 (Unauthorized)
    browser_client.dart:83 GET http://localhost:5192/api/orders/me?page=1&size=10 401 (Unauthorized)
    browser_client.dart:83 GET http://localhost:5192/api/user/profile 401 (Unauthorized)
    ```
- **Nguyên nhân:** Các provider trong Flutter ([api_providers.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/core/network/api_providers.dart)) tự động khởi chạy khi vào app. Do chưa có JWT Token trong `TokenStorage`, request gửi đi thiếu header `Authorization`, dẫn đến Backend từ chối với mã 401.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Trong `api_providers.dart`: Trước khi gọi các API yêu cầu xác thực (`userProfileProvider`, `ordersProvider`), kiểm tra token (`await tokenStorage.readToken()`). Nếu token là `null` hoặc rỗng, trả về danh sách rỗng `[]` hoặc `null` thay vì bắn Exception.
  - Xây dựng giao diện Guest State thân thiện trên từng màn hình, hướng dẫn người dùng đăng nhập khi cần.

---

## 12. Lỗi Scale tỷ lệ màn hình trên ứng dụng Mobile (Responsive Layout & Viewport)
- **Hiện tượng:**
  - Khi mở ứng dụng Mobile trên máy tính hoặc màn hình kích thước lớn, toàn bộ giao diện bị kéo dãn toàn màn hình (1920px), các khung nhập liệu, Bottom Navigation Bar và thẻ sản phẩm bị dãn rộng bất thường, làm hỏng tỷ lệ điện thoại chuẩn.
  - Hiệu ứng chuyển động (Ken Burns / scale nền 1.1 -> 1.0) trên màn hình xác thực `auth_screen.dart` và khoảng đệm `screenHeight / 2` bị tính toán sai.
- **Nguyên nhân:** Ứng dụng Flutter Mobile chưa được bọc khung giới hạn kích thước tối đa (`maxWidth`) khi hiển thị trên màn hình rộng, dẫn đến `Scaffold` mở rộng vô hạn.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Tại tầng gốc (`app_shell_scaffold.dart` hoặc `main.dart`): Bọc khung giao diện bằng `Center` kết hợp `ConstrainedBox(constraints: BoxConstraints(maxWidth: 480))` với nền viền đổ bóng giả lập khung hình điện thoại chuẩn.
  - Trong `auth_screen.dart`: Giới hạn khung form đăng nhập tối đa 440px và tính toán khoảng đệm dựa trên chiều cao tối thiểu khả dụng.

---

## 13. Lỗi không tải được ảnh lên trên Mobile (`studio_screen.dart`)
- **Hiện tượng:** Người dùng chọn ảnh và tải lên tại màn hình Studio ([studio_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/create/presentation/screens/studio_screen.dart)), nhưng quá trình tải thất bại, văng thông báo lỗi SnackBar.
- **Nguyên nhân gốc rễ:**
  1. **Không tương thích nền tảng Web của Flutter:** Hàm `uploadImage` trong `api_client.dart` dùng `http.MultipartFile.fromPath('file', filePath)`. Nền tảng web không hỗ trợ truy cập đường dẫn tệp cục bộ (`dart:io`), văng lỗi `Unsupported operation: MultipartFile.fromPath is not supported on the web`.
  2. **Yêu cầu đăng nhập bắt buộc (`[Authorize]`):** Controller `UploadController` trên Backend yêu cầu JWT Token để trích xuất `userId`. Người dùng chưa đăng nhập sẽ nhận mã lỗi 401.
  3. **Giới hạn dung lượng 5MB:** Camera điện thoại chụp ảnh dung lượng cao (> 5MB) vượt quá `[RequestSizeLimit(5MB)]` của server.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Cập nhật hàm `uploadImage` nhận mảng byte `Uint8List bytes` và `String filename`, sử dụng `http.MultipartFile.fromBytes('file', bytes, filename: filename)`.
  - Trong `studio_screen.dart`, nén ảnh trước khi tải: sử dụng `maxWidth: 1600` và `imageQuality: 80` trong `ImagePicker` để file luôn nhẹ dưới 2MB.
  - Kiểm tra đăng nhập trước khi mở bộ chọn ảnh.

---

## 14. Giỏ hàng trên Mobile còn dùng dữ liệu giả lập (Cart Screen Hardcoded Mock Data)
- **Hiện tượng:** Màn hình Giỏ hàng trên mobile ([cart_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/cart/presentation/screens/cart_screen.dart)) luôn hiển thị cố định 2 sản phẩm mẫu từ 2 cửa hàng giả lập `wynwynstore` và `doublefair.vn`. Thêm sản phẩm thật từ màn hình Shop thì giỏ hàng không thay đổi.
- **Nguyên nhân gốc rễ:**
  - File `cart_screen.dart` gán cứng `_groupedCart = {'wynwynstore': [MockData.products[0]], 'doublefair.vn': [MockData.products[1]]}`.
  - Mobile App hoàn toàn **chưa có `CartService`** trong `api_services.dart` và chưa có model ánh xạ (`CartItemModel`).
  - Chưa có `cartProvider` để liên kết giữa nút "Thêm vào giỏ" với danh sách hiển thị trên `cart_screen.dart`.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Tạo `CartService` trong `mobile/lib/features/cart/data/services/cart_service.dart` kết nối các API `/api/cart`.
  - Xây dựng `cartNotifierProvider` bằng Riverpod để quản lý giỏ hàng theo thời gian thực.
  - Chuyển `CartScreen` sang `ConsumerStatefulWidget`, thay thế mảng mock tĩnh bằng `ref.watch(cartProvider)`.

---

## 15. Yêu cầu loại bỏ khối "Chi tiết sản phẩm" và "Vận chuyển & chính sách" trong `product_detail_screen.dart`
- **Hiện tượng & Vấn đề giao diện:**
  - Trên màn hình xem chi tiết sản phẩm Mobile ([product_detail_screen.dart:272-294](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/screens/product_detail_screen.dart#L272-L294)), phía dưới phần Đánh giá đang xuất hiện hai khối thông tin tĩnh:
    1. **Khối "Chi tiết sản phẩm" (`ProductInfoSection`):** Hiển thị các thông số giả lập (Chất liệu: Acrylic cao cấp, Kích thước: 12x15 cm...).
    2. **Khối "Vận chuyển & chính sách" (`ProductShippingSection`):** Hiển thị các mục giao hàng tĩnh.
  - Các khối này chứa thông tin hardcode, kéo dài trang không cần thiết.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Xóa bỏ việc gọi `ProductInfoSection` và `ProductShippingSection` cùng các đường kẻ `Divider` ngăn cách trong `product_detail_screen.dart`.
  - Giữ lại luồng liền mạch: Bảng thao tác mua hàng (`ProductActionPanel`) -> Đánh giá sản phẩm (`ProductReviewsSection`) -> Sản phẩm liên quan (`ProductRelatedSection`).

---

## 16. Khối Đánh giá trên Mobile còn dùng Mock Data và để khoảng trắng 120px khi chưa có đánh giá
- **Hiện tượng:**
  - Ngay dưới tên sản phẩm trên mobile luôn hiển thị cứng đánh giá giả: `★ 4.9 (332 đánh giá)` cho tất cả mọi sản phẩm, kể cả sản phẩm mới tạo.
  - Tại khối Đánh giá bên dưới ([product_reviews_section.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/widgets/product_reviews_section.dart)), khi sản phẩm chưa có đánh giá nào (`reviews.isEmpty`):
    - Điểm trung bình bị hiển thị là `★ 0.0`.
    - Khung danh sách `ListView` vẫn giữ chiều cao cố định 120px gây ra khoảng trống rỗng vô nghĩa.
    - Phía dưới vẫn hiện nút bấm mờ: `Tất cả đánh giá (0)`.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Trong `product_detail_screen.dart`: Gỡ bỏ dòng text mock `4.9 (332 đánh giá)`. Nếu đánh giá bằng 0, hiển thị chữ `"Chưa có đánh giá"`.
  - Trong `product_reviews_section.dart`: Khi `reviews.isEmpty`, ẩn điểm số 0.0 và thay khoảng trống 120px bằng Empty State: Icon `Icons.rate_review_outlined` kèm nội dung: *"Sản phẩm này chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận nhé!"*.

---

## 17. Thiếu tính năng & giao diện "Viết đánh giá" trên Mobile App
- **Hiện tượng:** Trên ứng dụng mobile, người dùng chỉ xem được danh sách đánh giá tĩnh, hoàn toàn không có nút hoặc form cho phép khách hàng tự gửi bài đánh giá, chọn số sao hay nhận xét về sản phẩm.
- **Hiện trạng hạ tầng:** Backend .NET đã có sẵn hoàn chỉnh endpoint `POST /api/reviews`. Trong `review_service.dart` của mobile cũng đã viết sẵn hàm `createReview` nhưng chưa có giao diện gọi vào.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Tạo Modal Bottom Sheet "Viết đánh giá" (`WriteReviewBottomSheet`) trong mobile: thanh chọn 1-5 sao, ô nhập nhận xét, nút tải ảnh sản phẩm thực tế và nút "Gửi đánh giá".
  - Thêm nút *"Viết đánh giá"* trong `ProductReviewsSection`. Sau khi gửi thành công, tự động làm mới `reviewsProvider(productId)`.

---

## 18. Nút "Yêu thích" trên Mobile chỉ đổi biến local tạm thời, thiếu màn hình xem danh sách yêu thích
- **Hiện tượng:** Bấm vào biểu tượng trái tim tại chi tiết sản phẩm trên mobile, màn hình hiện SnackBar *"Đã thêm vào mục yêu thích"*. Nhưng thoát ra vào lại thì biến mất, và trong toàn bộ app không có màn hình nào để xem lại danh sách đã thích.
- **Nguyên nhân:** Hàm `_toggleFavorite()` trong `product_detail_screen.dart` chỉ đổi biến `_isFavorite` trong RAM của widget, không gọi API lưu trữ xuống database. Mobile cũng chưa có `FavoriteService` và chưa có màn hình `/favorites`.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Tạo `favorite_service.dart` trong mobile kết nối tới Backend `/api/favorites`.
  - Tạo `favoritesProvider` để đồng bộ trạng thái trái tim sáng đỏ trên toàn app theo dữ liệu thật.
  - Bổ sung màn hình danh sách yêu thích `FavoritesScreen` (route `/favorites`) hiển thị dạng lưới các sản phẩm đã lưu.

---

## 19. Nút Trái tim ở trang Profile Mobile bị điều hướng nhầm sang `/manifest`
- **Hiện tượng:** Tại trang Cá nhân/Hồ sơ trên mobile ([profile_screen.dart:78-82](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/profile/presentation/screens/profile_screen.dart#L78-L82)), ô tiện ích có icon trái tim `Icons.favorite_border` khi bấm vào lại chuyển hướng sang trang gửi điều ước (`/manifest`) thay vì dẫn đến danh sách Sản phẩm Yêu thích.
- **Nguyên nhân:** Khối card này đang gán cứng callback `() => context.push('/manifest')`.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Đổi tên nhãn thẻ thành **'Yêu thích'** với icon `Icons.favorite_border`.
  - Cập nhật hàm điều hướng trỏ chính xác về route: `() => context.push('/favorites')`.

---

## 20. Lỗi `ApiException(401): Request failed` khi gửi tin nhắn trong màn hình Chat AI Mobile
- **Hiện tượng:** Tại tab Chat trên mobile ([chat_list_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/chat/presentation/screens/chat_list_screen.dart)), người dùng nhập nội dung (ví dụ: *"tạo quà"*) và nhấn gửi thì bị văng thanh SnackBar màu đen: `ApiException(401): Request failed`.
- **Nguyên nhân:** Backend yêu cầu xác thực `[Authorize]` trên `AiChatController`. Giao diện Chat Mobile thiếu cơ chế kiểm tra đăng nhập trước khi cho phép gửi tin nhắn, và khối `catch (error)` in trực tiếp chuỗi lỗi kỹ thuật thô ra màn hình.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Trong `chat_list_screen.dart`, nếu người dùng chưa đăng nhập: hiển thị màn hình khóa thân thiện yêu cầu đăng nhập trước khi sử dụng AI Chatbot.
  - Trong khối `catch`, chuẩn hóa thông báo tiếng Việt: *"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục"*.

---

## 21. Màn hình Đơn hàng (Order) trên Mobile văng lỗi `ApiException(401)` do thiếu trạng thái Guest
- **Hiện tượng:** Khi bấm vào tab Order trên thanh điều hướng dưới mobile ([order_list_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/order/presentation/screens/order_list_screen.dart)), màn hình trống trơn và hiển thị dòng chữ lỗi: `Không thể tải đơn hàng: ApiException(401): Request failed`.
- **Nguyên nhân:** Endpoint `/api/orders/me` yêu cầu đăng nhập. Người dùng là khách vãng lai thì `ordersProvider` văng lỗi 401 và widget in trực tiếp `$error` ra màn hình.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Xây dựng giao diện Guest State trong `order_list_screen.dart`: Icon đơn hàng `Icons.receipt_long_outlined`, tiêu đề: *"Đăng nhập để theo dõi đơn hàng"*, mô tả hướng dẫn và nút bấm nổi bật **"Đăng nhập ngay"** dẫn sang `/auth`.
  - Trong `api_providers.dart`: Kiểm tra token trước khi gọi `getMyOrders()`. Nếu chưa có token, trả về danh sách rỗng thay vì ném Exception.

---

## 22. Yêu cầu loại bỏ mục "Thông báo & ưu đãi" và "Hồ sơ" trong màn hình Profile Mobile
- **Hiện tượng:** Trong danh sách cài đặt tại [profile_screen.dart:97-105](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/profile/presentation/screens/profile_screen.dart#L97-L105) xuất hiện 2 mục rỗng:
  1. **"Thông báo & ưu đãi"** (`Icons.notifications_none`, kèm chấm đỏ hiển thị badge giả lập số 3).
  2. **"Hồ sơ"** (`Icons.person_outline`).
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Xóa bỏ thẻ `_buildListTile` của mục "Thông báo & ưu đãi" và mục "Hồ sơ" cùng các đường phân cách `Divider`.
  - Xóa bỏ badge số 3 ảo để danh sách cài đặt còn lại (Tin nhắn, Cài đặt, Trợ giúp) gọn gàng, liền mạch.

---

## 23. Icon trong mục "Mua theo danh mục" trên Mobile Home bị lệch so với tên danh mục
- **Hiện tượng:** Tại trang chủ mobile ([home_screen.dart:292-301](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/home/presentation/screens/home_screen.dart#L292-L301)), thanh trượt ngang "Mua theo danh mục" hiển thị icon lệch hoàn toàn so với tên:
  - Vòng tay -> Icon Hộp quà (`Icons.card_giftcard`).
  - Dây chuyền -> Icon Ngôi nhà (`Icons.home_outlined`).
  - Lego -> Icon Trái tim (`Icons.favorite_border`).
  - Móc khóa -> Icon Đồng hồ (`Icons.watch_outlined`).
  - Hoa kẽm nhung -> Icon Ngôi sao (`Icons.auto_awesome`).
- **Nguyên nhân:** Hàm `_getCategoryIcon(int index)` gán cứng mảng 5 icon và lấy theo chỉ số vòng lặp `index % icons.length`, hoàn toàn không dựa vào tên danh mục trả về từ API.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Cập nhật hàm `_getCategoryIcon(String categoryName)` nhận vào tên danh mục và ánh xạ thông minh:
    - Chứa 'vòng'/'tay' -> `Icons.trip_origin` hoặc `Icons.circle_outlined`.
    - Chứa 'dây chuyền'/'cổ' -> `Icons.diamond_outlined`.
    - Chứa 'lego'/'xếp hình' -> `Icons.extension` (mảnh ghép puzzle).
    - Chứa 'móc khóa'/'khóa' -> `Icons.vpn_key_outlined`.
    - Chứa 'hoa' -> `Icons.local_florist_outlined`.
    - Chứa 'đèn' -> `Icons.light_outlined`.
    - Mặc định khác -> `Icons.category_outlined`.
  - Truyền tên danh mục `categories[index]['name']` vào hàm khi render.

---

## 24. Tổng rà soát và loại bỏ toàn bộ dữ liệu mẫu (Mock Data) trên Mobile App - Chuẩn hóa trạng thái rỗng ("Chưa có...")
- **Hiện tượng & Bối cảnh phát sinh:**
  - Trên ứng dụng Mobile Flutter còn tồn đọng rất nhiều dữ liệu mẫu (mock data), hình ảnh tĩnh Picsum/Unsplash, bộ hẹn giờ giả lập (fake delay), và các model giả lập.
  - Yêu cầu cốt lõi: **Gỡ bỏ triệt để 100% dữ liệu mock trên ứng dụng Mobile**. Chỗ nào chưa có dữ liệu thật thì hiển thị trạng thái rỗng chuẩn mực (Empty State) với thông báo rõ ràng: **"Chưa có..."**.
- **Danh sách chi tiết các vị trí trên Mobile cần xử lý:**
  1. **Giỏ hàng ([cart_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/cart/presentation/screens/cart_screen.dart)):**
     - Gỡ bỏ mảng mock `_groupedCart` ('wynwynstore', 'doublefair.vn').
     - Khi giỏ hàng rỗng: Hiển thị icon giỏ hàng rỗng, tiêu đề: *"Chưa có sản phẩm nào trong giỏ hàng"* và nút **"Khám phá ngay"**.
  2. **Chi tiết sản phẩm ([shop](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop)):**
     - *Thư viện ảnh ([product_image_gallery.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/widgets/product_image_gallery.dart)):* Gỡ bỏ logic random ảnh `picsum.photos`. Chỉ hiển thị đúng số lượng ảnh thực tế từ API.
     - *Đánh giá tóm tắt ([product_detail_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/screens/product_detail_screen.dart)):* Gỡ bỏ nhãn `Bestseller`, banner `Đang hot! 3 người mua...` và rating `★ 4.9`. Nếu chưa có đánh giá thì hiển thị: *"Chưa có đánh giá"*.
     - *Khối đánh giá ([product_reviews_section.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/widgets/product_reviews_section.dart)):* Thay khoảng trống 120px bằng Empty State: *"Chưa có đánh giá nào cho sản phẩm này."*.
     - *Sản phẩm tương tự ([product_related_section.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/widgets/product_related_section.dart)):* Gỡ bỏ `MockData.products`. Lấy sản phẩm thật cùng danh mục từ `productsProvider`; nếu không có thì hiển thị: *"Chưa có sản phẩm tương tự"*.
  3. **Trang chủ ([home_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/home/presentation/screens/home_screen.dart)):**
     - Khối 4-Square (`Recently viewed`, `Our favorites`, `Trending now`): Gỡ bỏ 12 ảnh `picsum.photos`. Nếu chưa có lịch sử duyệt, hiển thị: *"Chưa có sản phẩm đã xem gần đây"*.
     - Tab sản phẩm nổi bật ("Dành cho bạn", "Mới về"): Nếu danh sách rỗng, hiển thị: *"Chưa có sản phẩm nào"*.
  4. **Cửa hàng ([shop_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/screens/shop_screen.dart)):**
     - Gỡ bỏ ảnh banner tĩnh `picsum.photos/200/200?random=50`.
     - Khi lọc danh mục không có sản phẩm: Hiển thị *"Chưa có sản phẩm nào trong danh mục này."*.
  5. **Đặt hàng thành công ([checkout_success_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/checkout/presentation/screens/checkout_success_screen.dart)):**
     - Gỡ bỏ mã đơn cứng `#CV82947`. Nhận mã đơn thật từ kết quả checkout; nếu không có mã đơn thì ghi: *"Đơn hàng đã được tạo thành công."*. Sửa nút điều hướng về `/order`.
  6. **Module AI sáng tạo ([gift_ai_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/create/presentation/screens/gift_ai_screen.dart), [greeting_ai_screen.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/create/presentation/screens/greeting_ai_screen.dart)):**
     - Gỡ bỏ `Future.delayed(2s)` và câu trả lời bot giả ("Hộp pha lê khắc 3D...", "Chúc mừng sinh nhật em..."). Kết nối tới API AI thật của Backend; nếu lỗi hoặc chưa đăng nhập thì hiển thị thông báo rõ ràng.
  7. **Dọn dẹp các tệp Mock Data thừa ([mock_data.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/core/utils/mock_data.dart), [shop_local_datasource.dart](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/data/datasources/shop_local_datasource.dart)):**
     - Hủy bỏ toàn bộ tham chiếu import đến 2 tệp dữ liệu giả này để trình biên dịch kiểm soát 100% dữ liệu thật.

---

## 25. Yêu cầu loại bỏ thẻ "Đánh giá" trong cụm phím tắt hồ sơ cá nhân Mobile (`profile_screen.dart`)
- **Hiện tượng:** Tại màn hình Cá nhân trên mobile ([profile_screen.dart:77](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/profile/presentation/screens/profile_screen.dart#L77)), trong cụm lưới phím tắt thao tác nhanh 2x2 xuất hiện thẻ **"Đánh giá"** (`Icons.star_border`, sự kiện bấm `onTap: () {}` rỗng). Thẻ này không có tính năng thực tế và chiếm chỗ giao diện.
- **Giải pháp xử lý (khi tiến hành chỉnh sửa mã nguồn):**
  - Xóa hoàn toàn dòng gọi `_buildGridCard(Icons.star_border, 'Đánh giá', () {})`.
  - Tái cấu trúc 3 phím tắt còn lại ("Đơn mua", "Yêu thích", "Địa chỉ"):
    - Chuyển sang bố cục 3 cột ngang cân đối (`Row` kết hợp 3 widget `Expanded`), hoặc
    - 1 thẻ lớn toàn chiều rộng cho "Đơn mua" phía trên và hàng 2 thẻ song song cho "Yêu thích", "Địa chỉ" phía dưới.

---

## 26. Tải trang chậm, thời gian Render kéo dài (Render Lag) và các lỗi kiến trúc tiềm ẩn trên Mobile App
- **Hiện tượng:** Trên ứng dụng Mobile, việc tải các trang diễn ra rất chậm, thời gian chờ render lâu, khi chuyển tab thường xuyên bị khựng (jank/lag) hoặc hiển thị vòng tròn tải (spinner) quá lâu.
- **Phân tích nguyên nhân gốc rễ & Các lỗi tiềm ẩn trên Mobile App:**
  1. **Nghẽn mạng do Timeout 30 giây & Sai Base URL ([api_client.dart:27, 73](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/core/network/api_client.dart#L27-L73)):**
     - Base URL mặc định là `http://10.0.2.2:5000/api` (sai cổng so với Backend `5192`). Khi chạy trên thiết bị không kết nối được tới IP này, request chờ đủ 30 giây mới timeout, làm treo toàn bộ tiến trình render dữ liệu trang.
  2. **Tải và Render ảnh trực tiếp bằng `Image.network` không có Cache ([Image.network](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib)):**
     - Nhiều màn hình ([home_screen.dart:376](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/home/presentation/screens/home_screen.dart#L376), [shop_screen.dart:84](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/screens/shop_screen.dart#L84), [order_list_screen.dart:88](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/order/presentation/screens/order_list_screen.dart#L88), [product_image_gallery.dart:56](file:///d:/FPT/Semester_7/EXE101/CraftVision_3D/mobile/lib/features/shop/presentation/widgets/product_image_gallery.dart#L56)) dùng `Image.network` trực tiếp. Mỗi lần cuộn trang hoặc chuyển tab, ảnh phải tải lại từ đầu qua HTTP.
     - Ảnh Cloudinary độ phân giải gốc cao (2K-4K) được giải mã (decode) trực tiếp trên Main UI Thread mà không giới hạn `cacheWidth`/`cacheHeight`, gây tràn bộ nhớ RAM và tụt khung hình (Frame Drops/Jank).
  3. **Thiếu cơ chế Bộ nhớ đệm (Caching / Stale-While-Revalidate) ở Riverpod:**
     - Các `FutureProvider` tải lại toàn bộ dữ liệu từ đầu mỗi khi chuyển màn hình. Khi người dùng bấm qua lại giữa Home, Shop, Cart, Profile, app liên tục biến mất nội dung và hiển thị `CircularProgressIndicator`.
  4. **Nghẽn Render do bố cục lồng nhau (Double Layout Pass):**
     - Dùng `SingleChildScrollView` bọc ngoài các `GridView.builder` có thuộc tính `shrinkWrap: true` và `physics: NeverScrollableScrollPhysics()`, buộc Flutter Layout Engine phải tính toán kích thước 2 lần thay vì cơ chế ảo hóa (Virtualization/Lazy Rendering).
  5. **Bão lỗi 401 Unauthorized khi khởi động:**
     - Khi mở app ở chế độ Khách, các provider gọi đồng thời các endpoint bảo mật và văng Exception trực tiếp ra màn hình, gây gián đoạn luồng render.
- **Giải pháp tối ưu hóa toàn diện trên Mobile App:**
  - **Tự động nhận diện Base URL thông minh** (`localhost:5192` trên web/desktop, `10.0.2.2:5192` trên emulator) và giảm timeout từ 30s xuống 8-10s.
  - **Chuẩn hóa 100% hình ảnh sang `CachedNetworkImage`** kết hợp `memCacheWidth: 400`, `memCacheHeight: 400` để nén ảnh vừa vặn hiển thị, giảm 80% RAM và triệt tiêu giật lag.
  - **Áp dụng State Caching (Stale-While-Revalidate)** cho Riverpod để giữ dữ liệu cũ trong lúc tải ngầm dữ liệu mới.
  - **Tái cấu trúc bố cục sang `CustomScrollView` + `SliverList/SliverGrid`** để cuộn mượt mà 60-120fps.
  - **Bảo vệ Guest State:** Kiểm tra token trước khi gọi API có `[Authorize]`, tránh ném Exception 401 không cần thiết.

---
*(Tài liệu này sẽ tiếp tục được cập nhật thêm các lỗi mới của Ứng dụng Di động khi phát sinh)*
