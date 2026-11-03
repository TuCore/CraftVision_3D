# Mã giảm giá trên website

## Môi trường local để tự test

- Website: `http://127.0.0.1:3102`; backend test: `http://127.0.0.1:5199`.
- Admin: `voucher-admin@example.test`.
- Khách mới: `voucher7@example.test` (có thể dùng `voucher8@example.test` để thử tài khoản thứ hai).
- Mật khẩu các tài khoản giả trên: `VoucherTest@123`.
- Các tài khoản và dữ liệu này chỉ được tạo bởi test fixture trong PostgreSQL test ở cổng 5546, không phải tài khoản production.
- Admin mở `/admin/vouchers` để tạo mã mới hoặc chỉnh mã có sẵn. Dùng cửa sổ ẩn danh cho khách để giữ hai phiên đăng nhập riêng.
- Khách chọn sản phẩm **Voucher test gift**, thêm vào giỏ rồi dùng mã tại checkout. Chọn **COD** trong môi trường demo này; PayOS thật chưa được cấu hình.
- Sau khi tạo đơn, admin kiểm tra **Đang giữ lượt**; đổi đơn sang **Đang giao**, khách xác nhận nhận hàng, rồi admin xác nhận đã thu tiền COD. Khi đủ hai điều kiện, lượt đổi thành **Đã sử dụng**.
- Mã nguồn ở nhánh local `codex/web-vouchers`; chưa push hoặc merge vào `main`.

## Sử dụng

1. Admin vào **Quản trị → Mã giảm giá** (`/admin/vouchers`).
2. Chọn phần trăm từ 1–100, số khách tối đa và hạn dùng (có thể bỏ trống).
3. Nhấn **Tạo mã**. Hệ thống sinh mã ngẫu nhiên 8 ký tự, ví dụ `K7M9X2R8`, không chứa mức giảm và không dùng `I`, `O`, `0`, `1`. Mỗi mức giảm vẫn chỉ có một mã; tạo lại cùng mức giảm sẽ yêu cầu chỉnh mã hiện có.
4. Nhấn nút sao chép cạnh mã rồi tự gửi riêng cho khách. Hệ thống không tự gửi tin nhắn.
5. Khách đăng nhập, chọn hàng, nhập địa chỉ tại checkout rồi nhập mã và nhấn **Áp dụng**.

Giảm giá tính trên tiền sản phẩm, thiệp đi kèm và phí vận chuyển. Checkout hiển thị số tiền được backend tính lại. Khi đặt hàng, backend kiểm tra lại giá và điều kiện mã; mã có thể hết lượt giữa bước xem trước và đặt hàng.

Migration `20261103110000_RandomizeWebVoucherCodes` chuyển mã web cũ dạng `MA20%` thành mã ngẫu nhiên 8 ký tự khi backend khởi động lại. Admin cần copy lại mã mới để gửi khách; mã cũ không còn áp dụng cho đơn mới. Phần trăm, giới hạn, lịch sử lượt dùng và snapshot mã trên đơn đã tạo được giữ nguyên. Voucher cũ không thuộc quản lý web (`customer_limit IS NULL`) không thay đổi.

## Giới hạn và trạng thái lượt

- Mỗi tài khoản chỉ có một lượt đang giữ hoặc đã dùng cho mỗi mã. Mỗi đơn dùng tối đa một mã.
- **Đang giữ lượt:** đơn đã tạo nhưng chưa đủ hai điều kiện thanh toán và nhận hàng.
- **Đã sử dụng:** `PaymentStatus=Paid` và `OrderStatus=Delivered`. Cập nhật theo thứ tự nào trước cũng được, không đếm lặp.
- **Đã trả lượt:** đơn hủy chưa thanh toán đã xác minh đóng liên kết PayOS, hoặc đơn hủy đã xác nhận hoàn tiền.
- Lượt đã chốt sử dụng không tự phục hồi sau hoàn tiền.
- Còn khả dụng = giới hạn khách − lượt đang giữ − lượt đã dùng. Admin không thể giảm giới hạn xuống dưới số lượt đã chiếm.
- Khóa mã/hết hạn chỉ ngăn đơn mới; mức giảm của đơn đã tạo được giữ nguyên.

Đơn chuyển khoản giữ lượt 30 phút. Worker kiểm tra mỗi phút, đối soát thanh toán và đóng liên kết chưa thanh toán trước khi trả lượt. Nếu PayOS lỗi, trả thiếu tiền hoặc chưa xác minh đóng được liên kết, lượt vẫn được giữ. COD không tự hết lượt theo thời gian; admin cần hủy hoặc xử lý đơn.

Nếu tiền về trong lúc hủy đơn, hệ thống ghi nhận khoản thu cho đơn hủy để chờ hoàn tiền, không tự giao hàng hay mất lịch sử thanh toán. Admin chỉ chọn **Đã hoàn tiền** sau khi đã thực sự hoàn tiền cho khách; chức năng này không tự chuyển tiền hoàn qua PayOS.

Đơn giảm còn 0đ được xác nhận không cần thu tiền, không tạo PayOS. Đối với sản phẩm vật lý, lượt vẫn chờ giao/nhận thành công mới chốt đã dùng.

## Triển khai

- Không thay đổi ứng dụng trong `mobile/` hoặc contract kiểm tra voucher cũ.
- API mới được mô tả trong `api-specs/vouchers.openapi.yaml`.
- Migration mới: `20261103064222_AddWebVoucherReservations`; thêm trường vào voucher/order và bảng `voucher_usages`. Không xóa dữ liệu cũ.
- Backend tự migrate khi khởi động. Cần kiểm thử migration trên DB local có dữ liệu trước khi triển khai production.
- Database local cũ có thể dừng ở `20261008033125_AddCartAndWishlist`: migration tiếp theo thêm lại enum `BankTransfer` và tạo lại `cart_items`. `CompatibleMigrationsSqlGenerator` xử lý đúng các thao tác trùng này khi chạy migration, giữ nguyên cấu trúc giỏ hàng theo `cart_id` và dữ liệu hiện có. Không sửa migration lịch sử, không xóa bảng hay tự điền lịch sử migration để bỏ qua lỗi. Khởi động lại backend bằng bản build mới để áp dụng.
- Giá đơn được lưu snapshot; receipt/refund và mặt hàng bán chạy dùng số tiền sau phân bổ giảm giá, làm tròn tới đồng VND.
- Thanh toán thiệp riêng trong CardSharing không áp dụng mã này.

## Kiểm thử

Khởi động local từ thư mục gốc (Docker Desktop phải đang chạy):

```powershell
docker compose up -d db
dotnet run --project backend/src/CraftVision.Presentation/CraftVision.Presentation.csproj
```

Backend dùng PostgreSQL ở `localhost:5434`, HTTP ở `http://localhost:5192`. Lỗi `SocketException (10061)` ở cổng 5434 nghĩa là chưa kết nối được PostgreSQL; kiểm tra `docker compose ps db` trước. Không xóa volume database để xử lý lỗi này.

Frontend: `npm run test:vouchers`, các nhóm test hiện có, TypeScript và `npm run build`.

Backend: build/test project `backend/src/CraftVision.Infrastructure.Tests`. Các unit test chạy không cần DB. Test `WebVoucherTests.PopulatedMigrationCapacityRacesAndOrderLifecycle` yêu cầu `VOUCHER_TEST_CONNECTION` tới PostgreSQL local có pgvector, database tên `voucher_test`. Test tạo schema `voucher_test_<guid>` riêng và tự dọn schema; không dùng DB thật. Extension pgvector nên nằm ở schema `public` để nhiều lần chạy test không xung đột extension.

Test này tạo schema phiên bản cũ với `BankTransfer` và giỏ hàng có dữ liệu, để migration `AddMobileCommerceApis` chưa áp dụng rồi chạy migration thật hai lần. Test xác nhận giỏ hàng không mất dữ liệu, kiểm tra tranh chấp lượt cuối, giữ/chốt/trả lượt, tiền về sau hủy đơn, đơn 0đ, tạo NFC và cân đối snapshot doanh thu. Đặt `VOUCHER_TEST_KEEP_SCHEMA=1` chỉ khi cần giữ dữ liệu test để kiểm tra startup bằng `dotnet run`; dùng DB test riêng cho lần giữ schema đó.

Script HTTP `backend/src/CraftVision.Infrastructure.Tests/web-voucher-smoke.cjs` chỉ chấp nhận localhost, cần các biến `VOUCHER_SMOKE_USER`, `VOUCHER_SMOKE_PRODUCT`, `VOUCHER_SMOKE_JWT_SECRET`, và tùy chọn `VOUCHER_SMOKE_URL`. Chỉ trỏ tới host test với issuer `VoucherTest`, audience `VoucherTestWeb` và dữ liệu giả; script tạo mã/đơn test và xác nhận COD, không dùng trên môi trường thật.
