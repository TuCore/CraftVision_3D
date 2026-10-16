"use client";

import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Eye, Database, FileText, ArrowLeft, Mail, Phone } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <AppShell active="">
      <div className="max-w-4xl mx-auto py-6 md:py-10 space-y-8">
        {/* Header Breadcrumb */}
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">
                Chính Sách Bảo Mật
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Cập nhật lần cuối: Tháng 10, 2026 · CraftVision 3D (SIXC Group)
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="glass-card rounded-3xl p-6 md:p-10 space-y-8 border border-border shadow-soft leading-relaxed text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> 1. Cam kết bảo mật của CraftVision 3D
            </h2>
            <p className="text-muted-foreground">
              Chào mừng bạn đến với <strong className="text-foreground">CraftVision 3D</strong> (được phát triển bởi Nhóm SIXC). Chúng tôi hiểu rằng quyền riêng tư và việc bảo mật thông tin cá nhân là vô cùng quan trọng đối với bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin khi bạn sử dụng nền tảng tạo mô hình 3D, thiệp quà tặng thông minh NFC và các dịch vụ liên quan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> 2. Thông tin chúng tôi thu thập
            </h2>
            <p className="text-muted-foreground">Khi bạn đăng ký tài khoản và trải nghiệm nền tảng, chúng tôi có thể thu thập các loại dữ liệu sau:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Thông tin tài khoản:</strong> Họ tên, địa chỉ email, số điện thoại, ảnh đại diện khi đăng ký trực tiếp hoặc thông qua Google OAuth.
              </li>
              <li>
                <strong className="text-foreground">Dữ liệu tạo mẫu & Dự án 3D:</strong> Các tệp hình ảnh, bản phác thảo, văn bản gợi ý bạn tải lên để trợ lý AI tạo mô hình 3D hoặc sinh thiệp quà tặng.
              </li>
              <li>
                <strong className="text-foreground">Thông tin giao hàng:</strong> Địa chỉ người nhận, ghi chú giao hàng khi bạn đặt mua các sản phẩm vật lý (thiệp thủ công, phụ kiện gắn thẻ chip NFC).
              </li>
              <li>
                <strong className="text-foreground">Dữ liệu kỹ thuật & Nhật ký:</strong> Địa chỉ IP, loại trình duyệt, thời gian truy cập nhằm đảm bảo an toàn hệ thống và cải thiện trải nghiệm người dùng.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> 3. Mục đích sử dụng thông tin
            </h2>
            <p className="text-muted-foreground">Chúng tôi sử dụng thông tin thu thập được cho các mục đích chính đáng:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Cung cấp, vận hành và cá nhân hoá các tính năng tạo mô hình 3D, chat tương tác AI Vision plus.</li>
              <li>Ghi nhận và liên kết dữ liệu thiệp quà tặng vào công nghệ chip NFC trên sản phẩm vật lý.</li>
              <li>Xử lý đơn hàng, điều phối vận chuyển và gửi cập nhật trạng thái đơn hàng.</li>
              <li>Phát hiện, ngăn chặn các hành vi gian lận, truy cập trái phép hoặc tấn công an ninh mạng.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 4. Chia sẻ thông tin với bên thứ ba
            </h2>
            <p className="text-muted-foreground">
              Chúng tôi <strong className="text-foreground">cam kết không bán, cho thuê hoặc thương mại hóa</strong> dữ liệu cá nhân của bạn dưới bất kỳ hình thức nào. Thông tin chỉ được chia sẻ trong phạm vi cần thiết với:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Đối tác vận chuyển:</strong> Chia sẻ tên, số điện thoại và địa chỉ nhận hàng để thực hiện giao phát sản phẩm.</li>
              <li><strong className="text-foreground">Cổng thanh toán bảo mật:</strong> Để xác thực giao dịch thanh toán trực tuyến (PayOS, mã QR VietQR). Chúng tôi không lưu trữ mã PIN hay thông tin thẻ ngân hàng của bạn.</li>
              <li><strong className="text-foreground">Cơ quan chức năng:</strong> Khi có yêu cầu hợp pháp theo quy định của pháp luật hiện hành.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> 5. Quyền kiểm soát & Xoá dữ liệu của bạn
            </h2>
            <p className="text-muted-foreground">
              Bạn toàn quyền kiểm tra, cập nhật hoặc thay đổi thông tin cá nhân trong mục <Link href="/settings" className="text-primary hover:underline font-medium">Cài đặt tài khoản</Link>. Ngoài ra, bạn có thể thực hiện xoá tài khoản bất cứ lúc nào tại khu vực <em>Vùng nguy hiểm (Danger Zone)</em>. Dữ liệu tài khoản của bạn sẽ được vô hiệu hóa ngay lập tức.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-xl font-bold font-display text-foreground">6. Thông tin liên hệ hỗ trợ</h2>
            <p className="text-muted-foreground">
              Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào liên quan đến chính sách bảo mật, vui lòng liên hệ với chúng tôi:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Email hỗ trợ</div>
                  <div className="text-sm font-semibold text-foreground">sixc.ent921@gmail.com</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Hotline</div>
                  <div className="text-sm font-semibold text-foreground">0345579829</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
