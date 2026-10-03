import Link from "next/link";
import { Heart, Mail, Phone, Globe, HeadphonesIcon } from "lucide-react";
import Image from "next/image"; // If you want to use the Tiktok icon from public or next/image, but let's just use an SVG.

export function Footer() {
  return (
    <footer className="bg-[#121214] text-slate-300 py-12 px-6 md:px-12 mt-auto border-t border-white/10 relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Brand & Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Heart className="w-8 h-8 fill-primary" />
            <span className="font-display font-bold text-xl tracking-tight text-white">CraftVision <span className="text-primary">3D</span></span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
            Đến với CraftVision 3D, bạn có thể tự làm ra những món phụ kiện hoặc món quà khi trò chuyện cùng AI. Bên cạnh đó còn có thể tạo thiệp quà tặng online và mua những sản phẩm được tích hợp công nghệ NFC độc đáo.
          </p>
          <div className="space-y-3 pt-4">
            <a href="mailto:sixc.ent921@gmail.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              <span>sixc.ent921@gmail.com</span>
            </a>
            <a href="tel:0345579829" className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              <span>0345579829</span>
            </a>
            <a href="https://craft-vision-3d.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary transition-colors">
              <Globe className="w-4 h-4" />
              <span>craft-vision-3d.vercel.app</span>
            </a>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px] mt-0.5 shrink-0">C</span>
              <span>Chịu trách nhiệm nội dung bởi NHÓM SIXC</span>
            </div>
          </div>
        </div>

        {/* Sản Phẩm */}
        <div>
          <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">Sản Phẩm</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="/shop" className="text-primary hover:text-white transition-colors">Tất cả sản phẩm</Link></li>
            <li><Link href="/shop" className="text-primary hover:text-white transition-colors">Sản phẩm mới</Link></li>
            <li><Link href="/shop" className="text-primary hover:text-white transition-colors">Thịnh hành</Link></li>
            <li><Link href="/shop" className="text-primary hover:text-white transition-colors">Khuyến mãi</Link></li>
            <li className="pt-2">
              <Link href="#" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium">
                <span>🤝</span> Trở thành đối tác
              </Link>
            </li>
          </ul>
        </div>

        {/* Chủ Đề */}
        <div>
          <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">Chủ Đề</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="#" className="text-primary hover:text-white transition-colors">QR tình yêu</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">Cách tạo QR tình yêu</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">Mã QR tỏ tình</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">Trái tim QR 3D</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">Pháo hoa tình yêu</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">CraftVision3D là gì</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">Photobooth online</Link></li>
          </ul>
        </div>

        {/* Chính Sách & Kết Nối */}
        <div className="space-y-10">
          <div>
            <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">Chính Sách</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className="text-primary hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="/terms" className="text-primary hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link href="/refunds" className="text-primary hover:text-white transition-colors">Chính sách hoàn tiền</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">Kết Nối</h3>
            <div className="flex gap-4 mb-4">
              <a
                href="https://www.facebook.com/profile.php?id=61594809743775"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
              </a>
              <a
                href="https://www.tiktok.com/@sixc.ent?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 0011.3 3.93v-8.12a8.27 8.27 0 003.29.69v-3.45a4.79 4.79 0 01-2-.04z" /></svg>
              </a>
            </div>
            <p className="text-xs text-slate-400">Đăng ký nhận tin mới nhất từ chúng tôi</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p>© 2026 CraftVision 3D. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-slate-500 flex items-center justify-center text-[8px]">C</span>
            <span>Chịu trách nhiệm nội dung bởi NHÓM SIXC</span>
          </div>
        </div>

        {/* Support floating button representation for layout balance if needed, or actual support button */}
        <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#2563EB] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-transform z-50">
          <HeadphonesIcon className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white border-2 border-[#121214]">2</span>
        </button>
      </div>
    </footer>
  );
}
