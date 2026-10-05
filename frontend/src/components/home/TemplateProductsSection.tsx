"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, ChevronLeft, ChevronRight, Sparkles, PlayCircle } from "lucide-react";
import { cardTemplates, type CardTemplate } from "@/features/cards/catalog";
import { useTranslation } from "@/components/LanguageProvider";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CardSaleDetails } from "./CardSaleDetails";
import { TutorialVideoModal } from "./TutorialVideoModal";
import { getCardCommerce } from "@/features/cards/commerce";

export function TemplateProductsSection() {
  const { t, language } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [preview, setPreview] = useState<CardTemplate | null>(null);
  const [tutorial, setTutorial] = useState<CardTemplate | null>(null);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(cardTemplates.length / itemsPerPage);
  const displayedCards = cardTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const personalizeLabel = language === "vi" ? "Cá nhân hóa" : "Personalize";
  const changePage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("template-products")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  };

  return (
    <section id="template-products" className="w-full scroll-mt-24 py-16 sm:py-24 bg-background border-t border-border/40" aria-labelledby="template-products-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center mb-12 sm:mb-16 py-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-3xl h-[150%] bg-[#ffd1da] opacity-80 blur-[50px] rounded-[100%] pointer-events-none" />
          <div className="relative inline-flex items-center gap-3 sm:gap-4 z-10">
            <Sparkles className="h-7 w-7 sm:h-10 sm:w-10 text-[#4a0b19]" strokeWidth={2.5} />
            <h2 id="template-products-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4a0b19] tracking-tight text-center">{t("template.heading")}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCards.map(card => (
            <article key={card.slug} className="group flex flex-col bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 motion-safe:hover:-translate-y-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 30%, ${card.color}55, ${card.background})` }}>
                <img src={`/cards/previews/${card.slug}.webp`} alt={card.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
                <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-medium text-white">{card.category}</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-foreground text-sm sm:text-base mb-3">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{card.action}</p>
                <p className="text-xs text-muted-foreground mb-5">{card.fields.length} {language === "vi" ? "chi tiết riêng · Phong thư lời chúc" : "personal details · Greeting envelope"}</p>
                <div className="mt-auto"><CardSaleDetails slug={card.slug} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/cards/${card.slug}/edit`} className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2.5 text-xs font-semibold transition-colors shadow-sm"><Sparkles className="h-4 w-4" /> {personalizeLabel}</Link>
                  <button onClick={() => setPreview(card)} className="flex items-center justify-center gap-1.5 hover:bg-muted border border-border text-foreground rounded-xl py-2.5 text-xs font-semibold transition-colors"><Eye className="h-4 w-4" /> {t("template.view_demo")}</button>
                </div>
                <button onClick={() => setTutorial(card)} className="mt-4 inline-flex self-end items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 hover:underline"><PlayCircle className="h-4 w-4" />{t("template.tutorial_video")}</button>
              </div>
            </article>
          ))}
        </div>
        <nav aria-label={language === "vi" ? "Phân trang thiệp 3D" : "3D card pagination"} className="flex items-center justify-center gap-4 mt-12">
          <button aria-label={language === "vi" ? "Trang trước" : "Previous page"} onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-5 w-5" /></button>
          <span role="status" className="text-sm font-medium text-foreground text-center">{t("template.page")} {currentPage} / {totalPages}</span>
          <button aria-label={language === "vi" ? "Trang sau" : "Next page"} onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-5 w-5" /></button>
        </nav>
      </div>
      <TutorialVideoModal isOpen={tutorial !== null} onClose={() => setTutorial(null)} productTitle={tutorial?.title} video={tutorial ? {
        id: tutorial.id,
        templateId: tutorial.id,
        headerTitle: t("video.default_header"),
        videoUrl: getCardCommerce(tutorial.slug).videoUrl ?? "",
        captionTitle: t("video.default_caption"),
        captionDesc: t("video.default_desc"),
      } : null} />
      <Dialog open={preview !== null} onOpenChange={open => { if (!open) setPreview(null); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
          {preview && <>
            <DialogTitle>{preview.title}</DialogTitle>
            <DialogDescription>{preview.action}</DialogDescription>
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative w-[260px] max-w-full aspect-[9/19] shrink-0 overflow-hidden rounded-[2rem] border-8 border-gray-800 bg-black">
                <iframe key={preview.slug} title={t("demo.preview_title")} src={`/love-gift/${preview.slug}?preview=1`} className="absolute inset-0 h-full w-full border-0" />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{preview.reveal}</p>
                <Link href={`/cards/${preview.slug}/edit`} className="rounded-xl bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-600">{personalizeLabel} →</Link>
                <Link href={`/love-gift/${preview.slug}`} className="text-center text-sm font-semibold text-primary">{t("demo.live_view")} ↗</Link>
              </div>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
