import { Flame } from "lucide-react";
import { getCardCommerce, formatCardPrice } from "@/features/cards/commerce";
import { useTranslation } from "@/components/LanguageProvider";

export function CardSaleDetails({ slug }: { slug: string }) {
  const { t, language } = useTranslation();
  const { sold, originalPrice, salePrice } = getCardCommerce(slug);
  const pending = language === "vi" ? "Đang cập nhật" : "Coming soon";
  const discount = originalPrice !== undefined && salePrice !== undefined && originalPrice > salePrice && salePrice >= 0
    ? Math.round((1 - salePrice / originalPrice) * 100) : 0;

  return (
    <div className="mb-3 space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500"><Flame className="h-4 w-4 fill-orange-400 text-orange-500" />{t("template.sold")} {sold === undefined ? "—" : new Intl.NumberFormat("vi-VN").format(sold)}</span>
        {originalPrice !== undefined ? <del className="text-xs text-muted-foreground">{formatCardPrice(originalPrice)}</del> : <span className="text-xs text-muted-foreground">{language === "vi" ? "Giá gốc: —" : "Original: —"}</span>}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <strong className="text-lg font-extrabold text-rose-500">{salePrice === undefined ? pending : formatCardPrice(salePrice)}</strong>
        {discount > 0 && <span className="rounded border border-lime-300 bg-lime-50 px-1.5 py-0.5 text-xs font-medium text-lime-700">-{discount}%</span>}
      </div>
    </div>
  );
}
