"use client";

import { use, useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AIGiftWidget } from "@/components/AIGiftWidget";
import { Product } from "@/lib/product.types";
import {
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Flame,
  Eye,
  Info,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Pencil,
  LayoutGrid,
  CreditCard,
  ExternalLink,
  X,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useGreetingStore } from "@/store/useGreetingStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { useOrderStore } from "@/store/useOrderStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProductDemoModal } from "@/components/home/ProductDemoModal";
import { TutorialVideoModal } from "@/components/home/TutorialVideoModal";
import {
  INITIAL_TEMPLATE_PRODUCTS,
  TemplateProduct,
  TemplateVideo,
  DEFAULT_TUTORIAL_VIDEO,
} from "@/data/templateProducts";

function GreetingDesignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const id = (routeParams?.id as string) || "";
  const from3d = searchParams.get("from") === "3d";
  const modelUrl = searchParams.get("modelUrl");
  const customName = searchParams.get("customName");
  const editCartItemId = searchParams.get("editCartItemId");
  const isDefaultMode = searchParams.get("mode") === "default";

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateProduct | null>(null);
  const [message, setMessage] = useState("");
  const [greetingImage, setGreetingImage] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"link" | "qr">("link");
  const [quantity, setQuantity] = useState(1);

  // Template mặc định cố định ban đầu của sản phẩm
  const defaultProductTemplate = useMemo<TemplateProduct | null>(() => {
    if (!product) return null;
    return {
      id: 0,
      image: product.image,
      title: `Thiệp NFC mặc định (${product.name})`,
      sold: 1,
      originalPrice: 0,
      price: 0,
      discount: 0,
    };
  }, [product]);

  // Nếu người dùng chọn mode=default và chưa chọn template khác, tự động áp dụng template mặc định
  useEffect(() => {
    if (isDefaultMode && defaultProductTemplate && !selectedTemplate) {
      setSelectedTemplate(defaultProductTemplate);
    }
  }, [isDefaultMode, defaultProductTemplate, selectedTemplate]);

  // Template browser state
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [videoMap, setVideoMap] = useState<Record<number, TemplateVideo>>({});

  // Modals for Demo and Tutorial
  const [demoProduct, setDemoProduct] = useState<TemplateProduct | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<TemplateVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const { toggleFavorite, updateCartItem, items } = useWishlistStore();
  const { saveItem } = useCollectionStore();
  const store = useGreetingStore();

  useEffect(() => {
    // Check if route id is a template product id (e.g., "template-1" or numeric template ID)
    const isTemplateRoute = id.startsWith("template-") || (!isNaN(Number(id)) && Number(id) > 0 && Number(id) <= 200);
    const parsedTemplateId = id.startsWith("template-")
      ? parseInt(id.replace("template-", ""), 10)
      : (!isNaN(Number(id)) ? parseInt(id, 10) : null);

    if (isTemplateRoute && parsedTemplateId) {
      const tmpl = INITIAL_TEMPLATE_PRODUCTS.find((t) => t.id === parsedTemplateId) || INITIAL_TEMPLATE_PRODUCTS[0];
      setProduct({
        id: `template-${tmpl.id}`,
        name: tmpl.title,
        price: tmpl.price,
        category: "Thiệp điện tử",
        image: tmpl.image,
        rating: 5.0,
        description: "Thiết kế thiệp điện tử thông điệp 3D tích hợp công nghệ NFC.",
        matchScore: 100,
        is3D: true, // Crucial for 0 VND shipping fee
        isDigital: true,
      } as any);
      setSelectedTemplate(tmpl);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const p = await res.json();
          setProduct({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.categoryName || "Khác",
            image: p.sampleImageUrl || p.thumbnailUrl || "/image/placeholder.jpg",
            rating: 4.8,
            description: p.description || "",
            matchScore: 95,
            productType: p.productType,
          });
        } else {
          // Fallback to template if product not found
          const fallbackTmpl = INITIAL_TEMPLATE_PRODUCTS[0];
          setProduct({
            id: `template-${fallbackTmpl.id}`,
            name: fallbackTmpl.title,
            price: fallbackTmpl.price,
            category: "Thiệp điện tử",
            image: fallbackTmpl.image,
            rating: 5.0,
            description: "Thiết kế thiệp điện tử thông điệp 3D.",
            matchScore: 100,
            is3D: true,
            isDigital: true,
          } as any);
          setSelectedTemplate(fallbackTmpl);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/template-videos");
        if (res.ok) {
          const data = await res.json();
          setVideoMap(data);
        }
      } catch (e) {
        console.error("Lỗi khi tải video hướng dẫn:", e);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    if (from3d && modelUrl) {
      if (!customElements.get("model-viewer")) {
        const script = document.createElement("script");
        script.type = "module";
        script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
        document.head.appendChild(script);
      }
    }
  }, [from3d, modelUrl]);

  // Load cart item data if editing
  useEffect(() => {
    if (editCartItemId && items.length > 0) {
      const existingItem = items.find(
        (i) => (i.cartItemId || i.id) === editCartItemId || i.id === editCartItemId
      );
      if (existingItem) {
        if (existingItem.selectedTemplate) {
          setSelectedTemplate(existingItem.selectedTemplate as any);
        }
        if (existingItem.greetingMessage) {
          setMessage(existingItem.greetingMessage);
        }
        if (existingItem.greetingImage) {
          setGreetingImage(existingItem.greetingImage);
        }
        if (existingItem.senderName) {
          store.setField("senderName", existingItem.senderName);
        }
        if (existingItem.receiverName) {
          store.setField("receiverName", existingItem.receiverName);
        }
        if (existingItem.quantity) {
          setQuantity(existingItem.quantity);
        }
      }
    } else if (product && !editCartItemId) {
      const cartItem = items.find((i) => i.id === product.id && i.hasGreeting);
      if (cartItem) {
        if (cartItem.greetingMessage && !message) setMessage(cartItem.greetingMessage);
        if (cartItem.greetingImage && !greetingImage) setGreetingImage(cartItem.greetingImage);
        if (cartItem.selectedTemplate && !selectedTemplate) {
          setSelectedTemplate(cartItem.selectedTemplate as any);
        }
        if (cartItem.quantity) setQuantity(cartItem.quantity);
      }
    }
  }, [editCartItemId, items, product]);

  const handleOpenVideo = (template: TemplateProduct) => {
    const video =
      videoMap[template.id] ||
      template.video || {
        id: template.id,
        templateId: template.id,
        headerTitle: `${DEFAULT_TUTORIAL_VIDEO.headerTitle} - ${template.title}`,
        videoUrl: DEFAULT_TUTORIAL_VIDEO.videoUrl,
        captionTitle: DEFAULT_TUTORIAL_VIDEO.captionTitle,
        captionDesc: DEFAULT_TUTORIAL_VIDEO.captionDesc,
        detailUrl: DEFAULT_TUTORIAL_VIDEO.detailUrl,
      };
    setActiveVideo(video);
    setDemoProduct(template);
    setIsVideoModalOpen(true);
  };

  const handleConfirm = () => {
    if (!product) return;

    let finalProduct = product;
    if (from3d && modelUrl) {
      finalProduct = {
        ...product,
        name: customName || "Thiết kế 3D",
        price: 0,
        category: "3D",
        is3D: true,
        modelUrl: modelUrl,
      } as any;
    }

    const templateData = selectedTemplate
      ? {
          id: selectedTemplate.id,
          title: selectedTemplate.title,
          image: selectedTemplate.image,
          price: selectedTemplate.price,
          originalPrice: selectedTemplate.originalPrice,
          discount: selectedTemplate.discount,
        }
      : undefined;

    // Chế độ chỉnh sửa item trong giỏ: Cập nhật trực tiếp, KHÔNG tăng biến đếm sản phẩm!
    if (editCartItemId) {
      updateCartItem(editCartItemId, {
        hasGreeting: true,
        greetingMessage: message,
        greetingImage: greetingImage || undefined,
        senderName: store.senderName,
        receiverName: store.receiverName,
        selectedTemplate: templateData,
        quantity: quantity,
      });

      toast.success("Đã cập nhật thiệp và đơn hàng thành công!");
      router.push("/cart");
      return;
    }

    // Chế độ thêm mới hoặc từ trang chi tiết:
    toggleFavorite(
      finalProduct,
      true,
      message,
      greetingImage || undefined,
      store.senderName,
      store.receiverName,
      templateData,
      true // preserveQuantity: true không tự ý tăng gấp đôi nếu đã có trong giỏ
    );

    toast.success("Đã thêm sản phẩm kèm thiệp vào giỏ hàng!");
    router.push("/cart");
  };

  // Xử lý Thanh toán ngay (chuyển thẳng sang trang thanh toán không kèm chi phí ship nếu là thiệp điện tử)
  const handleDirectCheckout = () => {
    if (!product) return;

    const isDigitalCard = !!(selectedTemplate && (product.id.startsWith("template-") || (product as any).is3D));

    const orderItem = {
      product: {
        ...product,
        id: product.id,
        name: selectedTemplate?.title || product.name,
        price: selectedTemplate?.price || product.price,
        image: selectedTemplate?.image || product.image,
        category: isDigitalCard ? "Thiệp điện tử" : product.category,
        is3D: isDigitalCard ? true : (product as any).is3D,
        isDigital: isDigitalCard ? true : false,
      },
      quantity: quantity,
      gift: {
        giftTitle: selectedTemplate?.title || `Thiệp thông điệp - ${product.name}`,
        senderName: store.senderName || "Người gửi",
        receiverName: store.receiverName || "Người nhận",
        message: message,
        greetingMessage: message,
        greetingImage: greetingImage || undefined,
        previewImageUrl: greetingImage || selectedTemplate?.image,
        templateTitle: selectedTemplate?.title,
        secretKey: `CARD-${Date.now()}`,
      },
    };

    useOrderStore.getState().setItems([orderItem as any]);
    setIsPreviewModalOpen(false);
    toast.success("Đang chuyển tới trang thanh toán...");
    router.push("/checkout");
  };

  // Mở trang web xem trực tiếp thông điệp thiệp
  const handleLiveWebPreview = () => {
    if (typeof window !== "undefined") {
      const previewData = {
        title: selectedTemplate?.title || product?.name || "Thiệp thông điệp yêu thương",
        receiverName: store.receiverName || "Người nhận",
        senderName: store.senderName || "Người gửi",
        message: message || "Một món quà bất ngờ và ngập tràn yêu thương đang chờ đón bạn...",
        image: greetingImage || selectedTemplate?.image || "/dreamy-hero-bg.jpg",
        price: selectedTemplate?.price || product?.price || 49999,
        templateId: selectedTemplate?.id || 1,
      };
      sessionStorage.setItem("preview_greeting", JSON.stringify(previewData));

      const query = new URLSearchParams({
        preview: "1",
        title: previewData.title,
        receiver: previewData.receiverName,
        sender: previewData.senderName,
      });

      window.open(`/greeting-card?${query.toString()}`, "_blank");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          setGreetingImage(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "VND");
  };

  // Filter & Pagination for template cards
  const categories = ["Tất cả", "Trung thu", "VIP", "Tình yêu", "Sinh nhật"];
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "Tất cả") return INITIAL_TEMPLATE_PRODUCTS;
    return INITIAL_TEMPLATE_PRODUCTS.filter((t) =>
      t.title.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [selectedCategory]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const displayedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!product) {
    return (
      <AppShell active="shop">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-6xl space-y-8 py-8 px-4">
        {/* Top Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-card hover:bg-muted border border-border shadow-sm rounded-full transition-all hover:scale-105 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display gradient-text">
                {editCartItemId ? "Chỉnh sửa thiệp & đơn hàng" : "Thiết kế câu chúc riêng"}
              </h1>
              {editCartItemId && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold border border-blue-500/20">
                  Chế độ chỉnh sửa
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              {editCartItemId
                ? "Cập nhật lại mẫu thiệp, lời chúc hoặc số lượng mà không làm tăng biến đếm sản phẩm trong giỏ."
                : "Gửi gắm yêu thương qua từng thông điệp cá nhân hoá cùng thiệp thông minh."}
            </p>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Mảng bên trái: Giữ lại sản phẩm chính và mẫu thiệp đã chọn */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-5 shadow-soft border border-white/40 sticky top-24 space-y-5">
              {/* Product Image */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors z-10 pointer-events-none" />
                {from3d && modelUrl ? (
                  // @ts-ignore
                  <model-viewer
                    src={modelUrl}
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                    className="relative z-0"
                  ></model-viewer>
                ) : (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover relative z-0"
                  />
                )}
                {!from3d && (
                  <div className="absolute top-3 left-3 z-20 glass-strong px-2.5 py-1 rounded-lg text-[10px] font-bold text-foreground shadow-sm">
                    {product.category}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Sản phẩm chính
                </span>
                <h3 className="text-lg font-bold font-display leading-tight text-foreground mt-0.5">
                  {from3d && customName ? customName : product.name}
                </h3>
                {!from3d && (
                  <div className="text-xl font-bold font-display gradient-text mt-1">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>

              {/* Quantity Adjustment */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 dark:bg-card/60 border border-border/60 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-foreground">Số lượng đặt:</span>
                  <p className="text-[11px] text-muted-foreground">Chỉnh sửa số lượng sản phẩm</p>
                </div>
                <div className="flex items-center bg-white dark:bg-background rounded-xl border border-primary/20 overflow-hidden shadow-xs h-8">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-full flex items-center justify-center hover:bg-primary/10 text-primary font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs sm:text-sm font-bold text-primary">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-full flex items-center justify-center hover:bg-primary/10 text-primary font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mảng bên trái: Giữ lại thông tin mẫu thiết kế đã chọn */}
              {selectedTemplate ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      {selectedTemplate.id === 0 ? "Mẫu thiệp mặc định" : "Mẫu thiệp đã chọn"}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        router.push(`/shop/${id}/greeting`);
                      }}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {selectedTemplate.id === 0 ? (
                        <>
                          <LayoutGrid className="w-3 h-3" />
                          Chọn mẫu web
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          Đổi mẫu
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border/60 bg-muted">
                      <img
                        src={selectedTemplate.image}
                        alt={selectedTemplate.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2">
                        {selectedTemplate.title}
                      </h4>
                      {selectedTemplate.id === 0 ? (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Mẫu thiết kế cố định ban đầu (Tặng kèm sản phẩm)
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-extrabold text-rose-600">
                            {formatPrice(selectedTemplate.price)}
                          </span>
                          <span className="text-[10px] text-muted-foreground line-through">
                            {formatPrice(selectedTemplate.originalPrice)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider mb-0.5">
                      Bước 1: Chọn thiệp mẫu
                    </p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      Hãy chọn 1 mẫu thiệp từ danh sách bên phải hoặc dùng mẫu mặc định để bắt đầu thiết kế lời chúc.
                    </p>
                  </div>
                </div>
              )}

              {from3d ? (
                <div className="space-y-3 pt-2">
                  <p className="text-sm font-semibold text-foreground">Hình thức nhận thiết kế 3D:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDeliveryMethod("link")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        deliveryMethod === "link"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                      <span className="font-semibold text-sm">Gửi Link web</span>
                    </button>
                    <button
                      onClick={() => setDeliveryMethod("qr")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        deliveryMethod === "qr"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
                      <span className="font-semibold text-sm">Tạo mã QR</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary/90 leading-relaxed">
                  Thiệp vật lý tích hợp NFC sẽ được đóng gói cẩn thận cùng sản phẩm này, mang đến trải nghiệm mở quà bất ngờ cho người nhận.
                </div>
              )}
            </div>
          </div>

          {/* Mảng bên phải:
              Trạng thái 1: Show các thiệp mẫu (Hình 2) khi chưa chọn
              Trạng thái 2: Hiện form tạo câu chúc AI (Hình 4) khi đã chọn mẫu
          */}
          <div className="lg:col-span-8">
            {!selectedTemplate ? (
              /* Giao diện Hình 2: Danh sách các thiệp mẫu có thể thiết kế */
              <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft border border-white/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Bước 1: Chọn mẫu thiết kế
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                      Chọn mẫu thiệp NFC bạn muốn thiết kế
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Bấm &quot;Chọn mẫu&quot; để giữ mẫu và chuyển sang bước viết câu chúc cá nhân hóa.
                    </p>
                  </div>
                </div>

                {/* Banner chuyển sang Dùng mẫu mặc định ban đầu */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[color:var(--coral)]/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-[color:var(--coral)]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Không muốn chọn mẫu thiệp web?</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Sử dụng mẫu thiệp NFC tiêu chuẩn mặc định ban đầu của sản phẩm.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (defaultProductTemplate) {
                        setSelectedTemplate(defaultProductTemplate);
                      }
                    }}
                    className="px-4 py-2 rounded-xl btn-hero text-white text-xs font-bold shadow-coral-glow hover:scale-105 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Dùng mẫu mặc định
                  </button>
                </div>

                {/* Filter tags */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-primary text-white shadow-sm"
                          : "bg-white/60 dark:bg-card/60 hover:bg-muted text-muted-foreground border border-border/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid cards (Thiết kế y hệt Hình 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {displayedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group flex flex-col bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        <img
                          src={template.image}
                          alt={template.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1">
                        {/* Title */}
                        <h3 className="font-bold text-foreground text-sm line-clamp-2 min-h-[2.5rem] mb-3">
                          {template.title}
                        </h3>

                        {/* Sold & Price */}
                        <div className="flex flex-col gap-1.5 mt-auto mb-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
                              <Flame className="h-3.5 w-3.5 fill-orange-500" />
                              Đã bán: {template.sold}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(template.originalPrice)}
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-base sm:text-lg font-extrabold text-rose-600">
                              {formatPrice(template.price)}
                            </span>
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold rounded">
                              -{template.discount}%
                            </span>
                          </div>
                        </div>

                        {/* Buttons (Hình 2: Nút Mua ngay / Chọn mẫu & Xem demo) */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <button
                            onClick={() => {
                              setSelectedTemplate(template);
                              toast.success(`Đã chọn mẫu: "${template.title}"`);
                            }}
                            className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2.5 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4" /> Chọn mẫu
                          </button>
                          <button
                            onClick={() => {
                              setDemoProduct(template);
                              setIsDemoModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-muted border border-border text-foreground rounded-xl py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="h-4 w-4" /> Xem demo
                          </button>
                        </div>

                        {/* Links: Hướng dẫn & Video hướng dẫn */}
                        <div className="flex items-center justify-between text-xs font-medium px-1">
                          <button
                            onClick={() => handleOpenVideo(template)}
                            className="flex items-center gap-1.5 text-blue-500 hover:underline hover:text-blue-600 transition-all cursor-pointer"
                          >
                            <Info className="h-3.5 w-3.5" /> Hướng dẫn
                          </button>
                          <button
                            onClick={() => handleOpenVideo(template)}
                            className="flex items-center gap-1.5 text-rose-500 hover:underline hover:text-rose-600 transition-all cursor-pointer font-semibold"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Video hướng dẫn
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/40">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors ${
                        currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-medium text-muted-foreground">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors ${
                        currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Giao diện Hình 4: Form nhập thông tin lời chúc AI và ảnh thiệp */
              <div className="glass-card rounded-3xl p-6 md:p-8 space-y-8 shadow-soft border border-white/40">
                {/* Header trạng thái */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold mb-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {selectedTemplate.id === 0 ? "Mẫu thiệp mặc định" : "Bước 2: Thiết kế thông điệp thiệp"}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                      {selectedTemplate.id === 0
                        ? `Thiết kế câu chúc cho ${product?.name || "sản phẩm"}`
                        : `Tạo câu chúc cho mẫu: ${selectedTemplate.title}`}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {selectedTemplate.id === 0
                        ? "Dùng mẫu thiệp NFC mặc định ban đầu, nhập thông tin để AI viết lời chúc ấm áp."
                        : "Nhập thông tin người nhận để AI viết lời chúc ấm áp và cảm xúc nhất."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      router.push(`/shop/${id}/greeting`);
                    }}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer text-foreground"
                  >
                    {selectedTemplate.id === 0 ? (
                      <>
                        <LayoutGrid className="w-4 h-4 text-amber-600" />
                        Chọn mẫu từ thư viện web
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 text-primary" />
                        Đổi mẫu thiệp
                      </>
                    )}
                  </button>
                </div>

                {/* AI Gift Widget (Hình 4) */}
                <AIGiftWidget
                  receiverName=""
                  senderName=""
                  value={message}
                  onChange={setMessage}
                />

                {/* Image Upload Section */}
                <div className="border-t border-border/50 pt-8">
                  <h2 className="text-xl font-bold font-display mb-4">Ảnh in trên thiệp (Tuỳ chọn)</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 overflow-hidden relative shrink-0">
                      {greetingImage ? (
                        <>
                          <img src={greetingImage} alt="Uploaded" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setGreetingImage(null)}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white rounded-full p-1 transition-colors cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto text-primary/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-muted-foreground">Chưa có ảnh</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-sm text-muted-foreground mb-3">Tải lên một bức ảnh kỷ niệm để in lên mặt trước của thiệp NFC.</p>
                      <label className="inline-block cursor-pointer px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition-colors">
                        <span>Chọn ảnh tải lên</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-8">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        router.push(`/shop/${id}/greeting`);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold border border-border hover:bg-muted transition-colors text-foreground flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                    >
                      {selectedTemplate.id === 0 ? (
                        <>
                          <LayoutGrid className="w-4 h-4 text-amber-600" />
                          Xem kho mẫu web
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          Chọn mẫu khác
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => router.back()}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold border border-border hover:bg-muted transition-colors text-foreground cursor-pointer text-xs sm:text-sm"
                    >
                      Hủy
                    </button>
                  </div>

                  {/* 2 Main Options: Xem trước & Thanh toán ngay */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Xem trước
                    </button>

                    <button
                      onClick={handleDirectCheckout}
                      className="w-full sm:w-auto btn-hero px-7 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-coral-glow cursor-pointer text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Thanh toán ngay
                    </button>

                    <button
                      onClick={handleConfirm}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold border border-border bg-card hover:bg-muted transition-colors text-foreground flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                      title="Thêm vào giỏ hàng để mua sau"
                    >
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      {editCartItemId ? "Cập nhật giỏ" : "Thêm giỏ hàng"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Demo Modal */}
      <ProductDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        product={demoProduct}
      />

      {/* Tutorial Video Modal */}
      <TutorialVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={activeVideo}
        productTitle={demoProduct?.title}
      />

      {/* Popup Xem trước thông điệp thiệp */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-card border-primary/20 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-xs">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold font-display text-foreground">
              Xem trước thông điệp thiệp
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Kiểm tra hình ảnh và câu chúc trước khi mở trực tiếp hoặc thanh toán.
            </DialogDescription>
          </DialogHeader>

          {/* Visual Card Mockup */}
          <div className="my-4 p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/60 dark:from-muted/40 dark:to-muted/20 border border-primary/20 shadow-sm space-y-4">
            {/* Header of mockup */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/60 shrink-0">
                  <img
                    src={selectedTemplate?.image || product?.image}
                    alt="Template"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">
                    {selectedTemplate?.title || product?.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-primary">
                    Thiệp điện tử NFC & 3D
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-rose-600 block">
                  {formatPrice(selectedTemplate?.price || product?.price)}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Miễn phí vận chuyển (0đ)
                </span>
              </div>
            </div>

            {/* Recipient & Sender */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white/70 dark:bg-card/70 p-3 rounded-xl border border-border/50">
              <div>
                <span className="text-muted-foreground text-[10px] block uppercase font-bold">Người nhận:</span>
                <span className="font-bold text-foreground text-sm">
                  {store.receiverName || "Người thương"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block uppercase font-bold">Người gửi:</span>
                <span className="font-bold text-foreground text-sm">
                  {store.senderName || "Bạn"}
                </span>
              </div>
            </div>

            {/* Custom message */}
            <div className="p-4 rounded-xl bg-white dark:bg-card border border-rose-200/60 dark:border-rose-900/30 text-center relative overflow-hidden">
              <div className="absolute top-2 left-2 text-rose-200 dark:text-rose-900/30 text-4xl font-serif">“</div>
              <p className="text-sm font-serif italic text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed px-4 py-1">
                {message || "Chúc bạn luôn ngập tràn niềm vui, bình an và hạnh phúc trong cuộc sống!"}
              </p>
              <div className="absolute bottom-1 right-2 text-rose-200 dark:text-rose-900/30 text-4xl font-serif">”</div>
            </div>

            {/* Attached Photo if uploaded */}
            {greetingImage && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-card/60 border border-border/50">
                <img
                  src={greetingImage}
                  alt="Ảnh kỷ niệm"
                  className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">Ảnh kỷ niệm kèm thiệp</span>
                  <p className="text-[11px] text-muted-foreground">Ảnh sẽ hiển thị sống động khi người nhận mở bao thư và khám phá không gian 3D.</p>
                </div>
              </div>
            )}
          </div>

          {/* 2 Explicit Action Buttons in Modal: Xem trực tiếp & Thanh toán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleLiveWebPreview}
              className="py-3 px-4 rounded-xl font-bold border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              Xem trực tiếp
            </button>
            <button
              onClick={handleDirectCheckout}
              className="py-3 px-4 rounded-xl font-bold btn-hero text-white shadow-coral-glow hover:scale-[1.02] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Thanh toán ({formatPrice(selectedTemplate?.price || product?.price)})
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default function GreetingDesignPage() {
  return (
    <Suspense
      fallback={
        <AppShell active="shop">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        </AppShell>
      }
    >
      <GreetingDesignContent />
    </Suspense>
  );
}
