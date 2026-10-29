"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  MessageSquare,
  Image as ImageIcon,
  Wallet,
  Box,
  ArrowRight,
  Gift,
  Heart,
  Smartphone,
  Wand2,
  CheckCircle2,
  Store,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/authSession";
import api from "@/lib/api";
import { CARD_CATALOG_VISIBLE } from "@/features/cards/visibility";

interface HandmadePreviewItem {
  id: string;
  name: string;
  category: string;
  image: string;
  price?: number;
}

const EXTRA_HANDMADE_ITEMS: HandmadePreviewItem[] = [
  {
    id: "hm-custom-1",
    name: "Móc khóa cỏ 4 lá",
    category: "Phụ kiện",
    image: "/handmade-1.jpg",
    price: 35000,
  },
  {
    id: "hm-custom-2",
    name: "Thú len Amigurumi",
    category: "Len móc",
    image: "/handmade-2.jpg",
    price: 159000,
  },
];

const FALLBACK_HANDMADE_ITEMS: HandmadePreviewItem[] = [
  {
    id: "hm-1",
    name: "Hoa kẽm nhung",
    category: "Hoa",
    image: "/images/memory-flower/tulip.png",
    price: 189000,
  },
  {
    id: "hm-2",
    name: "Gấu bông",
    category: "Trang trí",
    image: "/images/memory-flower/wrapper.png",
    price: 249000,
  },
  ...EXTRA_HANDMADE_ITEMS,
];

const WEB_3D_CARD_PREVIEWS = [
  {
    slug: "starlight-birthday",
    title: "Điều ước sinh nhật dệt từ ánh sao",
    category: "Sinh nhật 3D",
    action: "Chạm mở phong thư & thắp nến 3D",
    image: "/cards/previews/starlight-birthday.webp",
  },
  {
    slug: "heart-key",
    title: "Trao chìa khóa, mở cửa trái tim",
    category: "Tình yêu 3D",
    action: "Xoay chìa khóa vàng mở khóa trái tim",
    image: "/cards/previews/heart-key.webp",
  },
  {
    slug: "rose-love",
    title: "Ngàn lời yêu trong một đóa hồng",
    category: "Valentine 3D",
    action: "Xoay không gian 3D đọc lời yêu thương",
    image: "/cards/previews/rose-love.webp",
  },
  {
    slug: "birthday-wish",
    title: "Thắp nến hồng, gửi ngàn điều ước",
    category: "Kỷ niệm 3D",
    action: "Tương tác chạm tắt nến trên trình duyệt",
    image: "/cards/previews/birthday-wish.webp",
  },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export function HomeIntroSections() {
  const router = useRouter();
  const [handmadeItems, setHandmadeItems] = useState<HandmadePreviewItem[]>(
    FALLBACK_HANDMADE_ITEMS
  );

  const { ref: visionRef, isVisible: isVisionVisible } = useScrollReveal();
  const { ref: handmadeRef, isVisible: isHandmadeVisible } = useScrollReveal();
  const { ref: card3dRef, isVisible: isCard3dVisible } = useScrollReveal();

  useEffect(() => {
    let mounted = true;
    const loadHandmadePreview = async () => {
      try {
        const { data } = await api.get("/api/products?page=1&pageSize=4");
        const items = data?.items;
        if (mounted && Array.isArray(items) && items.length >= 1) {
          const mapped: HandmadePreviewItem[] = items.slice(0, 2).map((p: any, idx: number) => {
            const parsedImages = p.sampleImageUrl
              ? p.sampleImageUrl.split(",")
              : p.images || [];
            const primary =
              parsedImages.length > 0
                ? parsedImages[0]
                : p.thumbnailUrl || FALLBACK_HANDMADE_ITEMS[idx % FALLBACK_HANDMADE_ITEMS.length].image;
            return {
              id: String(p.id || idx),
              name: p.name || FALLBACK_HANDMADE_ITEMS[idx % FALLBACK_HANDMADE_ITEMS.length].name,
              category: p.categoryName || "Handmade",
              image: primary,
              price: p.price,
            };
          });
          setHandmadeItems([...mapped, ...EXTRA_HANDMADE_ITEMS].slice(0, 4));
        }
      } catch {
        // Keep fallback handmade showcase images when offline or unauthenticated
      }
    };
    loadHandmadePreview();
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenVisionPlus = () => {
    const token = getAccessToken();
    if (!token) {
      toast.info("Vui lòng đăng nhập hoặc đăng ký để trò chuyện cùng Vision Plus!");
      router.push("/auth?redirect=/chat");
      return;
    }
    router.push("/chat");
  };

  return (
    <div id="template-products" className="w-full bg-background overflow-hidden">
      {/* =====================================================================
          SECTION 1: GIỚI THIỆU VISION PLUS (AI CHATBOT TRONG HỆ THỐNG)
      ===================================================================== */}
      <section
        aria-labelledby="vision-plus-heading"
        className="relative w-full py-20 sm:py-28 border-t border-border/40"
      >
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-4xl h-80 bg-rose-200/40 blur-[90px] rounded-full" />

        <div
          ref={visionRef}
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
            isVisionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-[#4a0b19] text-xs sm:text-sm font-bold tracking-wider uppercase mb-4 shadow-sm">
              <Bot className="h-4 w-4 text-rose-600" />
              <span>Trợ Lý Trí Tuệ Nhân Tạo Độc Quyền</span>
            </div>

            <h2
              id="vision-plus-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4a0b19] tracking-tight leading-tight"
            >
              Khám phá <span className="text-rose-600">Vision Plus</span> — Chatbot AI
              đồng hành sáng tạo quà tặng
            </h2>

            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              <strong>Vision Plus</strong> là trợ lý Chatbot AI thông minh được tích hợp trực tiếp
              trong hệ thống CraftVision 3D. Chỉ cần trò chuyện hoặc tải lên một bức ảnh mẫu,
              Vision Plus sẽ phân tích thị giác, lên ý tưởng quà tặng, liệt kê nguyên vật liệu,
              ước tính chi phí và dựng mô hình 3D chỉ trong vài giây.
            </p>
          </div>

          {/* Main Content: Left explanation + Right interactive AI chat showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Core Capabilities of Vision Plus */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="bg-card/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
                  <Sparkles className="h-6 w-6 text-rose-500 shrink-0" />
                  Vision Plus giúp gì cho bạn?
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-200/60">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-base">
                        Phân tích hình ảnh & Tư vấn ý tưởng thông minh
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Gửi bất kỳ bức ảnh món quà mẫu nào hoặc mô tả sở thích người nhận,
                        AI sẽ nhận diện phong cách, chất liệu và gợi ý phương án làm quà tối ưu nhất.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200/60">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-base">
                        Lên danh sách nguyên liệu & Dự toán ngân sách
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Tự động bóc tách danh sách nguyên vật liệu cần mua, ước tính chi phí
                        chi tiết theo ngân sách của bạn kèm hướng dẫn thực hiện từng bước.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-200/60">
                      <Box className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-base">
                        Kết nối Studio 3D tạo mô hình trực quan
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Tích hợp chế độ Studio 3D giúp chuyển đổi văn bản hoặc hình ảnh 2D
                        thành mô hình quà tặng 3D xoay 360° ngay trong không gian trò chuyện.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleOpenVisionPlus}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#4a0b19] via-rose-800 to-rose-600 hover:from-rose-700 hover:to-[#4a0b19] text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Trò chuyện với Vision Plus ngay
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Mockup of Vision Plus Chatbot */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl border border-rose-200/80 bg-gradient-to-br from-[#240a1b] via-[#341129] to-[#1a0714] p-5 sm:p-7 text-white shadow-2xl overflow-hidden">
                {/* Decorative top bar */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/15">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-300 flex items-center justify-center shadow-md">
                      <Bot className="h-5 w-5 text-black" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base">Vision Plus AI</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          Online
                        </span>
                      </div>
                      <p className="text-xs text-white/65">
                        Trợ lý phân tích hình ảnh & thiết kế quà tặng 3D
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
                    <Wand2 className="h-3.5 w-3.5 text-amber-300" />
                    <span>Vision + Studio 3D</span>
                  </div>
                </div>

                {/* Simulated Chat Conversation */}
                <div className="space-y-4 text-left text-sm">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-rose-500/90 text-white px-4 py-3 shadow-md">
                      <p className="font-medium">
                        Mình muốn làm một bó hoa tulip handmade tặng sinh nhật bạn gái, ngân sách khoảng 200k. Vision Plus gợi ý giúp mình nhé!
                      </p>
                    </div>
                  </div>

                  {/* AI reply */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm bg-white/10 backdrop-blur-md border border-white/15 p-4 space-y-3">
                      <p className="text-white/95 leading-relaxed">
                        Tuyệt vời! Với ngân sách <strong>~200.000đ</strong>, mình gợi ý bạn làm{" "}
                        <span className="text-amber-200 font-semibold">
                          Bó Hoa Tulip Kẽm Nhung Phối Đèn LED Đom Đóm
                        </span>{" "}
                        kèm thẻ NFC mở thiệp 3D:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="rounded-xl bg-black/30 p-3 border border-white/10">
                          <div className="text-xs text-rose-200 font-semibold mb-1">
                            📦 Nguyên liệu cần chuẩn bị
                          </div>
                          <ul className="text-xs text-white/80 space-y-1">
                            <li>• 100 sợi kẽm nhung pastel</li>
                            <li>• Giấy gói Hàn Quốc & ruy băng</li>
                            <li>• Dây đèn LED 2m + Thẻ NFC</li>
                          </ul>
                        </div>
                        <div className="rounded-xl bg-black/30 p-3 border border-white/10">
                          <div className="text-xs text-amber-200 font-semibold mb-1">
                            ⏱️ Dự toán & Thời gian
                          </div>
                          <ul className="text-xs text-white/80 space-y-1">
                            <li>• Chi phí: ~165.000đ</li>
                            <li>• Thời gian làm: 45 - 60 phút</li>
                            <li>• Độ khó: Dễ (có video mẫu)</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-rose-200">
                        <span>✨ Đã tạo sẵn danh sách mua hàng & hướng dẫn chi tiết</span>
                        <button
                          type="button"
                          onClick={handleOpenVisionPlus}
                          className="font-bold text-amber-300 hover:underline cursor-pointer"
                        >
                          Thử ngay →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: GIỚI THIỆU SẢN PHẨM HANDMADE
          (Hình ảnh ở bên trái - Giải thích & Nút mở danh sách sản phẩm ở bên phải, căn trái)
      ===================================================================== */}
      <section
        aria-labelledby="handmade-intro-heading"
        className="relative w-full py-20 sm:py-28 bg-gradient-to-b from-background via-rose-50/40 to-background border-t border-border/40"
      >
        <div
          ref={handmadeRef}
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
            isHandmadeVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* BÊN TRÁI: Những hình ảnh sản phẩm Handmade */}
            <div className="lg:col-span-6 order-1">
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                {handmadeItems.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.id}
                    className={`group relative rounded-3xl overflow-hidden border border-border/60 bg-card shadow-md hover:shadow-xl transition-all duration-500 ${
                      idx % 2 === 1 ? "sm:translate-y-6" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/4] w-full overflow-hidden bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#4a0b19] shadow-sm">
                        {item.category}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 text-left text-white">
                        <p className="font-bold text-xs sm:text-sm line-clamp-1 drop-shadow">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BÊN PHẢI (Text căn trái): Giải thích sản phẩm Handmade là gì & Nút mở danh sách sản phẩm */}
            <div className="lg:col-span-6 order-2 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-[#4a0b19] text-xs sm:text-sm font-bold tracking-wider uppercase shadow-sm">
                <Gift className="h-4 w-4 text-rose-600" />
                <span>Quà Tặng Thủ Công Tinh Tế</span>
              </div>

              <h2
                id="handmade-intro-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4a0b19] tracking-tight leading-tight text-left"
              >
                Sản phẩm <span className="text-rose-600">Handmade</span> là gì?
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-left">
                <strong>Sản phẩm Handmade</strong> là những món quà tặng, phụ kiện và vật phẩm
                trang trí được chế tác hoàn toàn thủ công bằng đôi bàn tay khéo léo từ các chất liệu
                gần gũi như len sợi, kẽm nhung, giấy mỹ thuật, hoa khô và sáp thơm tự nhiên.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed text-left">
                Khác với hàng sản xuất công nghiệp đại trà, mỗi sản phẩm handmade tại{" "}
                <strong>CraftVision 3D</strong> đều mang vẻ đẹp độc bản, gửi gắm sự tỉ mỉ và tâm huyết
                của người làm. Đặc biệt hơn, các món quà thủ công của chúng tôi còn được kết hợp
                cùng <strong>thẻ thông minh NFC / QR</strong> giúp người nhận chạm nhẹ điện thoại là mở
                ngay lời chúc 3D dành riêng cho mình.
              </p>

              <ul className="space-y-3 pt-1 text-left">
                <li className="flex items-center gap-3 text-sm sm:text-base text-foreground font-medium">
                  <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>Chế tác thủ công 100%, tỉ mỉ trong từng đường kim mũi chỉ và cánh hoa.</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-foreground font-medium">
                  <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>Đa dạng mẫu mã: Hoa handmade, thú len Amigurumi, vòng tay, set quà kỷ niệm.</span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-foreground font-medium">
                  <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>Hỗ trợ tích hợp thẻ NFC & cá nhân hóa thông điệp yêu thương đi kèm.</span>
                </li>
              </ul>

              {/* Nút mở tới màn hình danh sách các sản phẩm căn trái */}
              <div className="pt-4 flex justify-start">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#4a0b19] hover:bg-rose-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Store className="h-5 w-5" />
                  <span>Xem danh sách sản phẩm Handmade</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: GIỚI THIỆU THIỆP WEB 3D
          (Text ở bên trái - Hình ảnh ở bên phải)
      ===================================================================== */}
      {CARD_CATALOG_VISIBLE && <section
        aria-labelledby="web-3d-cards-heading"
        className="relative w-full py-20 sm:py-28 bg-background border-t border-border/40"
      >
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute bottom-10 right-10 w-96 h-96 bg-rose-200/35 blur-[100px] rounded-full" />

        <div
          ref={card3dRef}
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
            isCard3dVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* BÊN TRÁI: Text giới thiệu Thiệp Web 3D là gì + Nút khám phá */}
            <div className="lg:col-span-6 order-2 lg:order-1 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-[#4a0b19] text-xs sm:text-sm font-bold tracking-wider uppercase shadow-sm">
                <Layers className="h-4 w-4 text-rose-600" />
                <span>Công Nghệ Quà Tặng Số Tương Tác</span>
              </div>

              <h2
                id="web-3d-cards-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4a0b19] tracking-tight leading-tight text-left"
              >
                <span className="text-rose-600">Thiệp Web 3D</span> là gì?
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-left">
                <strong>Thiệp Web 3D</strong> là thế hệ thiệp chúc mừng kỹ thuật số tương tác ba chiều
                chạy trực tiếp trên trình duyệt web mà không cần cài đặt ứng dụng. Thay vì chỉ đọc
                những dòng chữ tĩnh trên mặt giấy, người nhận sẽ bước vào một không gian 3D sống động
                với hiệu ứng ánh sáng, âm nhạc và chuyển động mượt mà.
              </p>

              <p className="text-base text-muted-foreground leading-relaxed text-left">
                Tại <strong>CraftVision 3D</strong>, mỗi mẫu thiệp là một câu chuyện tương tác riêng:
                người nhận có thể chạm nhẹ để mở phong thư, tự tay thổi tắt nến trên chiếc bánh kem 3D,
                xoay chìa khóa mở trái tim hay ngắm nhìn hàng ngàn lời chúc bay lơ lửng giữa ngân hà.
              </p>

              <ul className="space-y-3 pt-1 text-left">
                <li className="flex items-center gap-3 text-sm sm:text-base text-foreground font-medium">
                  <Smartphone className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>
                    Trải nghiệm mượt mà trên mọi thiết bị: Điện thoại, máy tính bảng và laptop.
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-foreground font-medium">
                  <Sparkles className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>
                    Dễ dàng cá nhân hóa tên người nhận, lời chúc, hình ảnh kỷ niệm và giai điệu.
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm sm:text-base text-foreground font-medium">
                  <Heart className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>
                    Gửi tặng tức thì qua đường link riêng, mã QR hoặc gắn trực tiếp vào quà Handmade NFC.
                  </span>
                </li>
              </ul>

              <div className="pt-4 flex justify-start">
                <Link
                  href="/cards"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 to-[#4a0b19] hover:from-rose-700 hover:to-rose-900 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Heart className="h-5 w-5" />
                  <span>Khám phá bộ sưu tập Thiệp Web 3D</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* BÊN PHẢI: Hình ảnh minh họa các mẫu Thiệp Web 3D */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                {WEB_3D_CARD_PREVIEWS.map((card, idx) => (
                  <Link
                    key={card.slug}
                    href="/cards"
                    className={`group relative rounded-3xl overflow-hidden border border-border/60 bg-[#140718] shadow-md hover:shadow-2xl transition-all duration-500 block ${
                      idx % 2 === 1 ? "sm:translate-y-6" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-rose-200">
                        {card.category}
                      </span>
                    </div>
                    <div className="p-4 text-left bg-gradient-to-b from-[#1e0b24] to-[#120616] text-white">
                      <h3 className="font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-rose-200 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-white/70 mt-1 line-clamp-1">
                        {card.action}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>}
    </div>
  );
}
