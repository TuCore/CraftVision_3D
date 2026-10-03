"use client";

import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import { FileText, CheckCircle2, AlertOctagon, Scale, ShieldAlert, ArrowLeft, Mail, Phone } from "lucide-react";

export default function TermsPage() {
  return (
    <AppShell active="">
      <div className="max-w-4xl mx-auto py-6 md:py-10 space-y-8">
        {/* Header Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">
                Điều Khoản Sử Dụng
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
              <Scale className="w-5 h-5 text-primary" /> 1. Chấp thuận điều khoản
            </h2>
            <p className="text-muted-foreground">
              Bằng việc truy cập, đăng ký hoặc sử dụng nền tảng <strong className="text-foreground">CraftVision 3D</strong>, bạn đồng ý tuân thủ và bị ràng buộc bởi các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> 2. Đăng ký & Bảo mật tài khoản
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Bạn phải cung cấp thông tin chính xác, cập nhật khi tạo tài khoản trên hệ thống.</li>
              <li>Bạn có trách nhiệm bảo mật mật khẩu và các thông tin xác thực tài khoản của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn sẽ thuộc trách nhiệm của bạn.</li>
              <li>Thông báo ngay cho đội ngũ CraftVision 3D nếu bạn phát hiện bất kỳ dấu hiệu truy cập trái phép hoặc lỗ hổng bảo mật nào.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" /> 3. Quy định sử dụng dịch vụ AI & Tạo mẫu 3D
            </h2>
            <p className="text-muted-foreground">
              CraftVision 3D tích hợp trợ lý AI để tạo ý tưởng, xuất mô hình 3D và sinh thiệp tặng. Khi sử dụng công cụ này, người dùng cam kết:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Không tải lên hình ảnh, yêu cầu hoặc văn bản có nội dung đồi trụy, bạo lực, xúc phạm danh dự hoặc kích động thù địch.</li>
              <li>Không tạo các mô hình vi phạm quyền sở hữu trí tuệ hoặc nhãn hiệu độc quyền của bên thứ ba khi chưa có sự cho phép.</li>
              <li>Hệ thống có quyền tự động lọc, từ chối xử lý hoặc khóa tài khoản vi phạm các tiêu chuẩn đạo đức và pháp luật.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-primary" /> 4. Sản phẩm vật lý & Công nghệ NFC
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Sản phẩm thiệp & quà tặng handmade:</strong> Do tính chất thủ công và cá nhân hoá theo yêu cầu, màu sắc và chi tiết thực tế có thể có độ chênh lệch nhỏ so với bản dựng 3D mô phỏng trên màn hình.
              </li>
              <li>
                <strong className="text-foreground">Tính năng NFC:</strong> Chip NFC được ghi dữ liệu liên kết đến trang thiệp online của bạn. Vui lòng đảm bảo thiết bị di động của người nhận có hỗ trợ tính năng đọc thẻ NFC (NFC Reader).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" /> 5. Quyền sở hữu trí tuệ
            </h2>
            <p className="text-muted-foreground">
              Toàn bộ bản quyền mã nguồn, giao diện, logo, nhãn hiệu thương mại và tài sản kỹ thuật của CraftVision 3D đều thuộc quyền sở hữu của <strong className="text-foreground">NHÓM SIXC</strong>. Người dùng giữ bản quyền đối với các nội dung sáng tạo nguyên bản do chính mình tự thiết kế và đăng tải hợp pháp.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-xl font-bold font-display text-foreground">6. Liên hệ hỗ trợ & Khiếu nại</h2>
            <p className="text-muted-foreground">
              Mọi thắc mắc về điều khoản dịch vụ hoặc giải quyết khiếu nại, vui lòng liên hệ:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Email</div>
                  <div className="text-sm font-semibold text-foreground">sixc.ent921@gmail.com</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Điện thoại hỗ trợ</div>
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
