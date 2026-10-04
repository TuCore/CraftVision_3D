"use client";

import { AppShell } from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle, XCircle, Clock, CreditCard, ArrowLeft, Mail, Phone, HelpCircle } from "lucide-react";

export default function RefundsPage() {
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
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">
                Chính Sách Hoàn Tiền & Đổi Trả
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
              <HelpCircle className="w-5 h-5 text-primary" /> 1. Tổng quan chính sách
            </h2>
            <p className="text-muted-foreground">
              Tại <strong className="text-foreground">CraftVision 3D</strong>, sự hài lòng của khách hàng luôn là ưu tiên hàng đầu. Chúng tôi cam kết bảo vệ quyền lợi tối đa của bạn đối với cả các dịch vụ số (gói nâng cấp AI, credit tạo mẫu) và các sản phẩm vật lý (thiệp thủ công, quà tặng gắn chip NFC).
            </p>
          </section>

          {/* Hai cột so sánh */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle className="w-5 h-5" /> Trường hợp ĐƯỢC hoàn tiền / đổi mới
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                <li><strong className="text-foreground">Lỗi chip NFC:</strong> Thẻ/thiệp nhận về không thể quét được dữ liệu dù thiết bị người dùng có hỗ trợ NFC.</li>
                <li><strong className="text-foreground">Hư hỏng do vận chuyển:</strong> Sản phẩm bị cong gãy, rách nát hoặc vỡ trước khi đến tay người nhận.</li>
                <li><strong className="text-foreground">Giao sai sản phẩm:</strong> Sản phẩm không đúng mẫu mã, sai thông điệp đã đặt trên hệ thống.</li>
                <li><strong className="text-foreground">Lỗi giao dịch số:</strong> Bạn đã thanh toán thành công nhưng hệ thống không cộng credit hoặc nâng gói PRO sau 15 phút.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-3">
              <div className="flex items-center gap-2 text-destructive font-bold">
                <XCircle className="w-5 h-5" /> Trường hợp KHÔNG áp dụng hoàn tiền
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                <li>Khách hàng cung cấp sai địa chỉ, số điện thoại dẫn đến việc đơn hàng bị huỷ hoặc giao thất bại nhiều lần.</li>
                <li>Sản phẩm đã được in ấn, sản xuất hoàn tất theo yêu cầu riêng (customized) nhưng khách hàng đổi ý không muốn nhận.</li>
                <li>Sản phẩm bị hư hại vật lý do người dùng làm rơi vỡ, ngâm nước hoặc để ở môi trường nhiệt độ cao sau khi nhận.</li>
                <li>Thiết bị của người nhận không hỗ trợ công nghệ NFC (vui lòng kiểm tra tính tương thích trước khi đặt).</li>
              </ul>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> 2. Thời hạn tiếp nhận yêu cầu
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Đối với sản phẩm vật lý:</strong> Trong vòng <strong className="text-foreground">48 giờ</strong> kể từ thời điểm đơn vị vận chuyển ghi nhận giao hàng thành công.
              </li>
              <li>
                <strong className="text-foreground">Đối với dịch vụ số & thanh toán online:</strong> Trong vòng <strong className="text-foreground">24 giờ</strong> kể từ khi phát sinh lỗi trừ tiền.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> 3. Quy trình thực hiện hoàn tiền
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Gửi yêu cầu:</strong> Chụp ảnh/quay video tình trạng lỗi sản phẩm hoặc biên lai chuyển khoản gửi về email hoặc hotline hỗ trợ.
              </li>
              <li>
                <strong className="text-foreground">Xác minh:</strong> Đội ngũ chăm sóc khách hàng CraftVision 3D sẽ kiểm tra và phản hồi hướng xử lý trong vòng <strong className="text-foreground">24 giờ làm việc</strong>.
              </li>
              <li>
                <strong className="text-foreground">Hoàn trả hoặc Đổi mới:</strong> Nếu chọn đổi mới, chúng tôi sẽ sản xuất và gửi lại đơn hàng miễn phí 100%. Nếu chọn hoàn tiền, tiền sẽ được chuyển về tài khoản ban đầu trong từ <strong className="text-foreground">3 - 5 ngày làm việc</strong>.
              </li>
            </ol>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-xl font-bold font-display text-foreground">4. Kênh tiếp nhận hỗ trợ khiếu nại & hoàn tiền</h2>
            <p className="text-muted-foreground">
              Đội ngũ SIXC luôn sẵn sàng hỗ trợ để đảm bảo bạn có trải nghiệm trọn vẹn nhất:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Email khiếu nại</div>
                  <div className="text-sm font-semibold text-foreground">sixc.ent921@gmail.com</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Hotline hỗ trợ</div>
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
