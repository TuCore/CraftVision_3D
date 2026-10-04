"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Mail, Phone, Globe, HeadphonesIcon } from "lucide-react";
import Image from "next/image"; // If you want to use the Tiktok icon from public or next/image, but let's just use an SVG.
import { SupportModal } from "@/components/common/SupportModal";
import { useTranslation } from "@/components/LanguageProvider";

export function Footer() {
  const { t, language } = useTranslation();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
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
            {t("footer.desc")}
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
              <span>{t("footer.responsible")}</span>
            </div>
          </div>
        </div>

        {/* Sản Phẩm */}
        <div>
          <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">{t("footer.products")}</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="/shop" className="text-primary hover:text-white transition-colors">{t("footer.all_products")}</Link></li>
            <li><Link href="/shop" className="text-primary hover:text-white transition-colors">{t("footer.new_products")}</Link></li>
            <li><Link href="/shop" className="text-primary hover:text-white transition-colors">{t("footer.trending")}</Link></li>
            <li><Link href="/shop" className="text-primary hover:text-white transition-colors">{t("footer.promotions")}</Link></li>
            <li className="pt-2">
              <Link href="#" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium">
                <span>🤝</span> {t("footer.partner")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Chủ Đề */}
        <div>
          <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">{t("footer.topics")}</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="#" className="text-primary hover:text-white transition-colors">{t("footer.qr_love")}</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">{t("footer.how_to_create")}</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">{t("footer.confession_qr")}</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">{t("footer.heart_qr")}</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">{t("footer.fireworks")}</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">{t("footer.what_is")}</Link></li>
            <li><Link href="#" className="text-primary hover:text-white transition-colors">{t("footer.photobooth")}</Link></li>
          </ul>
        </div>

        {/* Chính Sách & Kết Nối */}
        <div className="space-y-10">
          <div>
            <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">{t("footer.policies")}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className="text-primary hover:text-white transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link href="/terms" className="text-primary hover:text-white transition-colors">{t("footer.terms")}</Link></li>
              <li><Link href="/refunds" className="text-primary hover:text-white transition-colors">{t("footer.refunds")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">{t("footer.connect")}</h3>
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
                href="https://www.instagram.com/sixc.ent921?stkn=MTNpaDFpZGFicDl2cQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
            </div>
            <p className="text-xs text-slate-400">
              {language === "vi" ? "Đăng ký nhận tin mới nhất từ chúng tôi" : "Subscribe to receive our latest updates"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p>© 2026 CraftVision 3D. {language === "vi" ? "Tất cả các quyền được bảo lưu." : "All rights reserved."}</p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-slate-500 flex items-center justify-center text-[8px]">C</span>
            <span>{t("footer.responsible")}</span>
          </div>
        </div>

        {/* Support floating button representation for layout balance if needed, or actual support button */}
        <button 
          type="button"
          onClick={() => setIsSupportOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all z-50 cursor-pointer"
          title={t("support.header")}
        >
          <HeadphonesIcon className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white border-2 border-[#121214]">2</span>
        </button>
      </div>

      {/* Support & Consultation Modal (Matching Hình 2) */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </footer>
  );
}
