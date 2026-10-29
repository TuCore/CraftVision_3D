"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AIGiftWidget } from "@/components/AIGiftWidget";
import { Product } from "@/lib/product.types";
import { getAccessToken } from "@/lib/authSession";
import {
  ArrowLeft,
  Sparkles,
  Eye,
  CreditCard,
  ExternalLink,
  ShoppingCart,
  Music,
  Image as ImageIcon,
  Trash2,
  Palette,
  RefreshCw,
  Gift,
  Box,
  Orbit,
} from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useGreetingStore } from "@/store/useGreetingStore";
import { useOrderStore } from "@/store/useOrderStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SharedTutorialButton } from "@/features/tutorials/SharedTutorialButton";
import { type TemplateProduct } from "@/data/templateProducts";
import {
  cardTemplates,
  defaultDraft,
  type CardTemplate,
  type CardDraft,
} from "@/features/cards/catalog";
import {
  saveDraft,
  readDraft,
  importPhoto,
  importAudio,
} from "@/features/cards/storage";
import { getCardCommerce } from "@/features/cards/commerce";
import {
  ENABLED_CURATED_MODELS,
  COSMIC_BACKGROUNDS,
  PHOTO_FORMATIONS,
  FREE_PHOTO_LIMIT,
  EXTRA_PHOTO_PRICE_VND,
  MAX_CARD_PHOTOS,
  calculateExtraPhotoFee,
  getCuratedModel,
  getCosmicBackground,
  getPhotoFormation,
} from "@/features/cards/curatedModels";
import { VoiceRecorderField } from "@/features/cards/VoiceRecorderField";

type GreetingTemplate = TemplateProduct & {
  slug: string;
  category: string;
  action: string;
  reveal: string;
  rawTemplate: CardTemplate;
};

const WEB_CARD_TEMPLATES: GreetingTemplate[] = cardTemplates.map((template) => {
  const retailPrice = getCardCommerce(template.slug).salePrice || 49000;
  return {
    id: template.id,
    slug: template.slug,
    category: template.category,
    image: `/cards/previews/${template.slug}.webp`,
    title: template.title,
    sold: 0,
    originalPrice: retailPrice,
    price: retailPrice,
    discount: 20,
    action: template.action,
    reveal: template.reveal,
    rawTemplate: template,
  };
});

// Format Thiệp 3D Duy Nhất chuẩn của hệ thống
const MASTER_CARD_TEMPLATE: GreetingTemplate = {
  ...WEB_CARD_TEMPLATES[0],
  title: "Thiệp 3D Vũ Trụ Kỷ Niệm CraftVision",
};

function GreetingDesignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const id = (routeParams?.id as string) || "";
  const from3d = searchParams.get("from") === "3d";
  const modelUrl = searchParams.get("modelUrl");
  const customName = searchParams.get("customName");
  const editCartItemId = searchParams.get("editCartItemId");
  const initialQtyParam = Number(searchParams.get("quantity")) || 1;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedTemplate] = useState<GreetingTemplate>(MASTER_CARD_TEMPLATE);

  // 1. Model 3D (do chủ hệ thống cung cấp) & Background Vũ trụ 3D có chiều sâu
  const [sceneModelId, setSceneModelId] = useState<string>(ENABLED_CURATED_MODELS[0].id);
  const [bgStyleId, setBgStyleId] = useState<string>(COSMIC_BACKGROUNDS[0].id);
  const [bgColor, setBgColor] = useState<string>(COSMIC_BACKGROUNDS[0].nebulaPrimary);

  // 2. Lời mở đầu thiệp & Tâm thư
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [cardTitle, setCardTitle] = useState("Một Món Quà Nhỏ Giữa Vũ Trụ");
  const [introText, setIntroText] = useState("Giữa hàng triệu vì sao, món quà này dành riêng cho bạn");
  const [letterTitle, setLetterTitle] = useState("Gửi người đặc biệt của tôi");
  const [message, setMessage] = useState("");
  const [closingText, setClosingText] = useState("Với tất cả yêu thương");

  // 3. Hình ảnh kỷ niệm (Miễn phí 5 ảnh, từ ảnh thứ 6 +5.000đ/ảnh) & Cách trình bày 3D
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFormationId, setPhotoFormationId] = useState<string>(PHOTO_FORMATIONS[0].id);

  // 4. Âm nhạc xuyên suốt & Ghi âm Giọng nói (kèm văn bản xuất hiện từng chữ cái)
  const [audioData, setAudioData] = useState<string>("");
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [voiceData, setVoiceData] = useState<string>("");
  const [voiceText, setVoiceText] = useState<string>("");

  // 5. Tùy chỉnh Phong thư & Màu chủ đạo
  const [accentColor, setAccentColor] = useState<string>(ENABLED_CURATED_MODELS[0].defaultColor);
  const [envelopeColor, setEnvelopeColor] = useState<string>("#f9e8d4");
  const [envelopeLabel, setEnvelopeLabel] = useState<string>("Dành riêng cho bạn");
  const [sealType, setSealType] = useState<string>("Trái tim");

  const [quantity, setQuantity] = useState(Math.max(1, initialQtyParam));
  const [previewVersion, setPreviewVersion] = useState(1);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);

  const { toggleFavorite, updateCartItem, items } = useWishlistStore();
  const store = useGreetingStore();

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const isPhysical = useMemo(() => {
    if (!product) return false;
    return (
      !product.id.startsWith("template-") &&
      product.category !== "Thiệp điện tử" &&
      !(product as unknown as { isDigital?: boolean }).isDigital
    );
  }, [product]);

  const getBaseCardPrice = useCallback(
    (template: GreetingTemplate | null | undefined): number => {
      if (!template) return 39200;
      const retailPrice = template.originalPrice || template.price || 49000;
      return isPhysical ? Math.round(retailPrice * 0.8) : retailPrice;
    },
    [isPhysical]
  );

  const extraPhotoPricing = useMemo(
    () => calculateExtraPhotoFee(photos.length),
    [photos.length]
  );

  const calculatePricing = useMemo(() => {
    if (!product) {
      return {
        basePrice: 0,
        baseCardPrice: 0,
        extraPhotoCount: 0,
        extraPhotoFee: 0,
        cardPrice: 0,
        unitPrice: 0,
        totalItemPrice: 0,
      };
    }
    const baseCardPrice = getBaseCardPrice(selectedTemplate);
    const cardPrice = baseCardPrice + extraPhotoPricing.extraFee;

    if (!isPhysical) {
      return {
        basePrice: 0,
        baseCardPrice,
        extraPhotoCount: extraPhotoPricing.extraCount,
        extraPhotoFee: extraPhotoPricing.extraFee,
        cardPrice,
        unitPrice: cardPrice,
        totalItemPrice: cardPrice * quantity,
      };
    }
    const basePrice = product.price || 0;
    const unitPrice = basePrice + cardPrice;
    return {
      basePrice,
      baseCardPrice,
      extraPhotoCount: extraPhotoPricing.extraCount,
      extraPhotoFee: extraPhotoPricing.extraFee,
      cardPrice,
      unitPrice,
      totalItemPrice: unitPrice * quantity,
    };
  }, [product, isPhysical, selectedTemplate, quantity, getBaseCardPrice, extraPhotoPricing]);

  const rawStock = (product as unknown as { stock?: number })?.stock ?? 0;
  const greetingMaxStock =
    isPhysical && (product as unknown as { stock?: number })?.stock !== undefined
      ? Math.max(0, rawStock)
      : undefined;
  const isGreetingOutOfStock =
    isPhysical &&
    (product as unknown as { stock?: number })?.stock !== undefined &&
    rawStock === 0;

  const handleGreetingDecrease = () => setQuantity((q) => Math.max(1, q - 1));

  const handleGreetingIncrease = () => {
    if (greetingMaxStock !== undefined && greetingMaxStock > 0 && quantity >= greetingMaxStock) {
      toast.warning(`Kho chỉ còn ${greetingMaxStock} sản phẩm! Không thể tăng thêm.`);
      return;
    }
    setQuantity((q) => {
      const next = q + 1;
      if (greetingMaxStock !== undefined && greetingMaxStock > 0 && next > greetingMaxStock) {
        toast.warning(`Kho chỉ còn ${greetingMaxStock} sản phẩm!`);
        return greetingMaxStock;
      }
      return next;
    });
  };

  const handleGreetingQuantityChange = (val: string) => {
    if (val === "") {
      setQuantity(1);
      return;
    }
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQuantity(1);
      return;
    }
    if (greetingMaxStock !== undefined && greetingMaxStock > 0 && parsed > greetingMaxStock) {
      toast.warning(`Kho chỉ còn lại ${greetingMaxStock} sản phẩm! Đã tự động điều chỉnh về tối đa.`);
      setQuantity(greetingMaxStock);
      return;
    }
    setQuantity(parsed);
  };

  // Tạo đối tượng CardDraft chuẩn từ toàn bộ tùy chỉnh của người dùng
  const buildCurrentDraft = useCallback(
    (tmpl: GreetingTemplate): CardDraft => {
      const base = defaultDraft(tmpl.rawTemplate);
      const effectiveRecipient = recipientName.trim() || store.receiverName || "Người thương";
      const effectiveSender = senderName.trim() || store.senderName || "Một người luôn bên bạn";
      const effectiveTitle = cardTitle.trim() || tmpl.title;
      const effectiveMessage = message.trim() || tmpl.rawTemplate.message;

      base.values.recipient = effectiveRecipient;
      base.values.sender = effectiveSender;
      base.values.title = effectiveTitle;
      base.values.intro =
        introText.trim() || "Giữa hàng triệu vì sao, món quà này dành riêng cho bạn";
      base.values.letterTitle = letterTitle.trim() || "Gửi người đặc biệt của tôi";
      base.values.message = effectiveMessage;
      base.values.closing = closingText.trim() || "Với tất cả yêu thương";

      base.values.sceneModel = sceneModelId;
      base.values.bgStyle = bgStyleId;
      base.values.bgColor = /^#[0-9a-f]{6}$/i.test(bgColor) ? bgColor : "#7b2cbf";
      base.values.photoFormation = photoFormationId;

      base.values.accent = /^#[0-9a-f]{6}$/i.test(accentColor)
        ? accentColor
        : tmpl.rawTemplate.color;
      base.values.envelopeColor = /^#[0-9a-f]{6}$/i.test(envelopeColor)
        ? envelopeColor
        : "#f9e8d4";
      base.values.envelopeLabel = envelopeLabel.trim() || "Dành riêng cho bạn";
      base.values.seal = ["Trái tim", "Ngôi sao", "Bông hoa"].includes(sealType)
        ? sealType
        : "Trái tim";

      base.values.photo = photos[0] || "";
      base.values.album = photos.slice(0, MAX_CARD_PHOTOS);
      base.values.audio = audioData || "";
      base.values.voice = voiceData || "";
      base.values.voiceText = voiceText.trim() || "";

      return base;
    },
    [
      recipientName,
      senderName,
      store.receiverName,
      store.senderName,
      cardTitle,
      introText,
      letterTitle,
      message,
      closingText,
      sceneModelId,
      bgStyleId,
      bgColor,
      photoFormationId,
      accentColor,
      envelopeColor,
      envelopeLabel,
      sealType,
      photos,
      audioData,
      voiceData,
      voiceText,
    ]
  );

  // Tự động lưu bản nháp vào IndexedDB và làm mới khung 3D mỗi khi người dùng thay đổi nội dung
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const draft = buildCurrentDraft(selectedTemplate);
        await saveDraft(draft);
        setPreviewVersion((v) => v + 1);
      } catch (err) {
        console.error("Failed to sync 3D card draft:", err);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [selectedTemplate, buildCurrentDraft]);

  const handleForceRefreshPreview = async () => {
    try {
      const draft = buildCurrentDraft(selectedTemplate);
      await saveDraft(draft);
      setPreviewVersion((v) => v + 1);
      toast.success("Đã cập nhật nội dung lên cảnh Thiệp 3D!");
    } catch {
      toast.error("Không thể cập nhật bản xem thử.");
    }
  };

  // Tải thông tin sản phẩm vật lý
  useEffect(() => {
    const isTemplateRoute =
      id.startsWith("template-") || (!isNaN(Number(id)) && Number(id) > 0 && Number(id) <= 200);
    if (isTemplateRoute) {
      setProduct({
        id: `template-${MASTER_CARD_TEMPLATE.id}`,
        name: MASTER_CARD_TEMPLATE.title,
        price: MASTER_CARD_TEMPLATE.price,
        category: "Thiệp điện tử",
        image: MASTER_CARD_TEMPLATE.image,
        rating: 5.0,
        description: "Thiết kế thiệp điện tử thông điệp 3D tích hợp công nghệ NFC.",
        matchScore: 100,
        is3D: true,
        isDigital: true,
      } as unknown as Product);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const p = await res.json();
          const parsedImages = p.sampleImageUrl
            ? p.sampleImageUrl.split(",")
            : p.images?.map((img: { url?: string } | string) =>
                typeof img === "string" ? img : img.url
              ) || [];
          setProduct({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.categoryName || "Khác",
            image:
              parsedImages.length > 0
                ? parsedImages[0]
                : p.thumbnailUrl || "/image/placeholder.jpg",
            rating: 4.8,
            description: p.description || "",
            matchScore: 95,
            productType: p.productType,
            stock: p.stock ?? 0,
          });
        } else {
          setProduct({
            id: `template-${MASTER_CARD_TEMPLATE.id}`,
            name: MASTER_CARD_TEMPLATE.title,
            price: MASTER_CARD_TEMPLATE.price,
            category: "Thiệp điện tử",
            image: MASTER_CARD_TEMPLATE.image,
            rating: 5.0,
            description: "Thiết kế thiệp điện tử thông điệp 3D.",
            matchScore: 100,
            is3D: true,
            isDigital: true,
          } as unknown as Product);
        }
      } catch (e) {
        console.error(e);
      }
    };
    void fetchProduct();
  }, [id]);

  useEffect(() => {
    if (from3d && modelUrl) {
      if (!customElements.get("model-viewer")) {
        const script = document.createElement("script");
        script.type = "module";
        script.src =
          "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
        document.head.appendChild(script);
      }
    }
  }, [from3d, modelUrl]);

  // Nạp lại dữ liệu khi chỉnh sửa sản phẩm từ giỏ hàng
  useEffect(() => {
    if (editCartItemId && items.length > 0) {
      const existingItem = items.find(
        (i) => (i.cartItemId || i.id) === editCartItemId || i.id === editCartItemId
      );
      if (existingItem) {
        if (existingItem.greetingMessage) setMessage(existingItem.greetingMessage);
        if (existingItem.senderName) {
          setSenderName(existingItem.senderName);
          store.setField("senderName", existingItem.senderName);
        }
        if (existingItem.receiverName) {
          setRecipientName(existingItem.receiverName);
          store.setField("receiverName", existingItem.receiverName);
        }
        if (existingItem.greetingImage) {
          setPhotos([existingItem.greetingImage]);
        }
        if (existingItem.draftValues) {
          const dv = existingItem.draftValues;
          if (typeof dv.title === "string") setCardTitle(dv.title);
          if (typeof dv.intro === "string") setIntroText(dv.intro);
          if (typeof dv.letterTitle === "string") setLetterTitle(dv.letterTitle);
          if (typeof dv.closing === "string") setClosingText(dv.closing);
          if (typeof dv.sceneModel === "string") setSceneModelId(dv.sceneModel);
          if (typeof dv.bgStyle === "string") setBgStyleId(dv.bgStyle);
          if (typeof dv.bgColor === "string") setBgColor(dv.bgColor);
          if (typeof dv.photoFormation === "string") setPhotoFormationId(dv.photoFormation);
          if (typeof dv.audio === "string" && dv.audio) {
            setAudioData(dv.audio);
            setAudioFileName("Nhạc nền đã lưu");
          }
          if (typeof dv.voice === "string") setVoiceData(dv.voice);
          if (typeof dv.voiceText === "string") setVoiceText(dv.voiceText);
          if (Array.isArray(dv.album) && dv.album.length > 0) {
            setPhotos(dv.album.filter((x): x is string => typeof x === "string"));
          } else if (typeof dv.photo === "string" && dv.photo) {
            setPhotos([dv.photo]);
          }
          if (typeof dv.accent === "string") setAccentColor(dv.accent);
          if (typeof dv.envelopeColor === "string") setEnvelopeColor(dv.envelopeColor);
          if (typeof dv.envelopeLabel === "string") setEnvelopeLabel(dv.envelopeLabel);
          if (typeof dv.seal === "string") setSealType(dv.seal);
        } else {
          readDraft(selectedTemplate.slug).then((saved) => {
            if (!saved) return;
            const dv = saved.values;
            if (typeof dv.audio === "string" && dv.audio) {
              setAudioData(dv.audio);
              setAudioFileName("Nhạc nền đã lưu");
            }
            if (typeof dv.voice === "string") setVoiceData(dv.voice);
            if (typeof dv.voiceText === "string") setVoiceText(dv.voiceText);
            if (Array.isArray(dv.album) && dv.album.length > 0) {
              setPhotos(dv.album.filter((x): x is string => typeof x === "string"));
            }
          });
        }
        if (existingItem.quantity) setQuantity(existingItem.quantity);
      }
    }
  }, [editCartItemId, items, selectedTemplate.slug, store]);

  // Xử lý tải nhiều ảnh kỷ niệm lên Thiệp 3D (Miễn phí 5 ảnh đầu, từ ảnh thứ 6 +5.000đ/ảnh, tối đa 20 ảnh)
  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (photos.length + files.length > MAX_CARD_PHOTOS) {
      toast.warning(`Tối đa ${MAX_CARD_PHOTOS} hình ảnh kỷ niệm trên thiệp 3D.`);
      return;
    }
    setIsUploadingMedia(true);
    try {
      const converted = await Promise.all(files.map((file) => importPhoto(file)));
      const nextCount = photos.length + converted.length;
      setPhotos((prev) => [...prev, ...converted]);
      if (nextCount > FREE_PHOTO_LIMIT) {
        const extra = nextCount - FREE_PHOTO_LIMIT;
        toast.success(
          `Đã thêm ảnh! Bạn đang có ${nextCount} ảnh (${FREE_PHOTO_LIMIT} ảnh miễn phí + ${extra} ảnh thêm: +${(
            extra * EXTRA_PHOTO_PRICE_VND
          ).toLocaleString("vi-VN")}đ).`
        );
      } else {
        toast.success(`Đã chèn ${converted.length} ảnh vào Thiệp 3D!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể đọc tệp hình ảnh.");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMovePhoto = (index: number, direction: -1 | 1) => {
    setPhotos((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // Xử lý tải nhạc nền phát xuyên suốt
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploadingMedia(true);
    try {
      const dataUrl = await importAudio(file);
      setAudioData(dataUrl);
      setAudioFileName(file.name);
      toast.success(`Đã chèn nhạc nền "${file.name}" vào Thiệp 3D!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải tệp âm thanh.");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleConfirm = async () => {
    if (!product) return;

    const token = getAccessToken();
    if (!token) {
      toast.info("Vui lòng đăng nhập hoặc đăng ký để thêm vào giỏ hàng!");
      router.push("/auth");
      return;
    }

    const draft = buildCurrentDraft(selectedTemplate);
    try {
      await saveDraft(draft);
    } catch (err) {
      console.error(err);
    }

    let finalProduct = product;
    if (from3d && modelUrl) {
      finalProduct = {
        ...product,
        name: customName || "Thiết kế 3D",
        price: 0,
        category: "3D",
        is3D: true,
        modelUrl: modelUrl,
      } as unknown as Product;
    }

    const { basePrice, cardPrice, unitPrice } = calculatePricing;
    const effectiveSender = senderName.trim() || store.senderName || "Người gửi";
    const effectiveRecipient = recipientName.trim() || store.receiverName || "Người nhận";
    const effectiveMessage = message.trim() || selectedTemplate.rawTemplate.message;
    const primaryPhoto = photos[0] || undefined;

    const templateData = {
      id: selectedTemplate.id,
      slug: selectedTemplate.slug,
      title: cardTitle.trim() || selectedTemplate.title,
      image: selectedTemplate.image,
      price: cardPrice,
      originalPrice: (selectedTemplate.originalPrice || selectedTemplate.price) + calculatePricing.extraPhotoFee,
      discount: 20,
      is3D: true,
    };

    const cartProduct = {
      ...finalProduct,
      name: isPhysical ? finalProduct.name : selectedTemplate.title || finalProduct.name,
      price: unitPrice,
      basePrice: isPhysical ? basePrice : undefined,
      cardPrice: isPhysical ? cardPrice : undefined,
      image: isPhysical ? finalProduct.image : selectedTemplate.image || finalProduct.image,
    };

    if (editCartItemId) {
      updateCartItem(editCartItemId, {
        ...cartProduct,
        hasGreeting: true,
        greetingMessage: effectiveMessage,
        greetingImage: primaryPhoto,
        senderName: effectiveSender,
        receiverName: effectiveRecipient,
        cardSlug: selectedTemplate.slug,
        cardType: "web_library_3d",
        originalCardPrice: templateData.originalPrice,
        discountedCardPrice: cardPrice,
        selectedTemplate: templateData,
        draftValues: draft.values,
        quantity: quantity,
      });

      toast.success("Đã cập nhật thiệp 3D và sản phẩm trong giỏ hàng!");
      router.push("/cart");
      return;
    }

    if (isPhysical && isGreetingOutOfStock) {
      toast.error("Sản phẩm đã hết hàng trong kho!");
      return;
    }
    if (isPhysical && greetingMaxStock !== undefined && quantity > greetingMaxStock) {
      toast.warning(
        `Kho chỉ còn ${greetingMaxStock} sản phẩm! Đã tự động điều chỉnh về tối đa.`
      );
      setQuantity(greetingMaxStock);
      return;
    }

    toggleFavorite(cartProduct, {
      hasGreeting: true,
      greetingMessage: effectiveMessage,
      greetingImage: primaryPhoto,
      senderName: effectiveSender,
      receiverName: effectiveRecipient,
      cardSlug: selectedTemplate.slug,
      cardType: "web_library_3d",
      originalCardPrice: templateData.originalPrice,
      discountedCardPrice: cardPrice,
      selectedTemplate: templateData,
      customQuantity: quantity,
    });

    const addedItem = useWishlistStore
      .getState()
      .items.find(
        (item) =>
          item.id === cartProduct.id && item.selectedTemplate?.slug === selectedTemplate.slug
      );
    if (addedItem) {
      updateCartItem(addedItem.cartItemId || addedItem.id, { draftValues: draft.values });
    }

    toast.success("Đã thêm sản phẩm kèm Thiệp 3D vào giỏ hàng!", {
      action: {
        label: "Xem giỏ hàng",
        onClick: () => router.push("/cart"),
      },
    });
  };

  const handleDirectCheckout = async () => {
    if (!product) return;

    if (isPhysical && isGreetingOutOfStock) {
      toast.error("Sản phẩm đã hết hàng trong kho!");
      return;
    }
    if (isPhysical && greetingMaxStock !== undefined && quantity > greetingMaxStock) {
      toast.warning(
        `Kho chỉ còn ${greetingMaxStock} sản phẩm! Đã tự động điều chỉnh về tối đa.`
      );
      setQuantity(greetingMaxStock);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      toast.info("Vui lòng đăng nhập hoặc đăng ký để tiến hành thanh toán!");
      router.push("/auth?redirect=/checkout");
      return;
    }

    const draft = buildCurrentDraft(selectedTemplate);
    try {
      await saveDraft(draft);
    } catch (err) {
      console.error(err);
    }

    const { basePrice, cardPrice, unitPrice } = calculatePricing;
    const effectiveSender = senderName.trim() || store.senderName || "Người gửi";
    const effectiveRecipient = recipientName.trim() || store.receiverName || "Người nhận";
    const effectiveMessage = message.trim() || selectedTemplate.rawTemplate.message;
    const primaryPhoto = photos[0] || undefined;

    const orderItem = {
      product: {
        ...product,
        id: product.id,
        name: isPhysical ? product.name : selectedTemplate.title || product.name,
        price: unitPrice,
        basePrice: isPhysical ? basePrice : undefined,
        cardPrice: isPhysical ? cardPrice : undefined,
        image: isPhysical ? product.image : selectedTemplate.image || product.image,
        category: isPhysical ? product.category : "Thiệp điện tử",
        is3D: isPhysical ? (product as unknown as { is3D?: boolean }).is3D : true,
        isDigital: !isPhysical,
      },
      quantity: quantity,
      hasGreeting: true,
      cardSlug: selectedTemplate.slug,
      cardPrice,
      draftValues: draft.values,
      gift: {
        giftTitle: cardTitle.trim() || selectedTemplate.title,
        templateTitle: selectedTemplate.title,
        cardPrice: cardPrice,
        originalCardPrice:
          (selectedTemplate.originalPrice || selectedTemplate.price) +
          calculatePricing.extraPhotoFee,
        cardSlug: selectedTemplate.slug,
        templateId: selectedTemplate.id,
        senderName: effectiveSender,
        receiverName: effectiveRecipient,
        message: effectiveMessage,
        greetingMessage: effectiveMessage,
        greetingImage: primaryPhoto,
        previewImageUrl: primaryPhoto || selectedTemplate.image,
        threeDModelUrl: `slug:${selectedTemplate.slug}`,
        threeDModelType: "GLB",
        theme: selectedTemplate.slug,
        messageSource: "Manual",
        secretKey: `CARD-${Date.now()}`,
      },
    };

    useOrderStore.getState().setItems([orderItem as never]);
    setIsPreviewModalOpen(false);
    toast.success("Đang chuyển tới trang thanh toán...");
    router.push("/checkout");
  };

  const handleLiveWebPreview = async () => {
    if (typeof window !== "undefined") {
      try {
        const draft = buildCurrentDraft(selectedTemplate);
        await saveDraft(draft);
      } catch (e) {
        console.error(e);
      }
      window.open(`/love-gift/${selectedTemplate.slug}?draft=1`, "_blank");
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

  const activeCuratedModel = getCuratedModel(sceneModelId);
  const activeCosmicBg = getCosmicBackground(bgStyleId);
  const activeFormation = getPhotoFormation(photoFormationId);

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
      <div className="mx-auto max-w-7xl space-y-6 py-6 px-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-card hover:bg-muted border border-border shadow-sm rounded-full transition-all hover:scale-105 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display gradient-text">
                  {editCartItemId
                    ? "Chỉnh sửa Thiệp 3D Vũ Trụ & Đơn hàng"
                    : "Thiết kế Thiệp 3D Vũ Trụ đi kèm quà Handmade"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-500/20">
                  Format 3D Điện Ảnh Duy Nhất
                </span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                Kịch bản: Mở thiệp hiện 1–2 ảnh mở màn → Chuyển cảnh vũ trụ → Chạm Model 3D phát giọng nói & chữ chạy từng ký tự → Mở phong thư & ngắm ảnh xoay quanh.
              </p>
            </div>
          </div>
          <SharedTutorialButton productTitle={selectedTemplate.title} className="self-start sm:self-auto" />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* CỘT TRÁI (5 phần): KHUNG XEM TRƯỚC THIỆP 3D LIVE & TÓM TẮT GIÁ ĐƠN HÀNG */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            {/* 1. Khung Xem Trước Thiệp 3D Trực Tiếp */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 shadow-soft border border-white/40 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Xem trước Thiệp 3D trực tiếp
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleForceRefreshPreview}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
                    title="Làm mới cảnh 3D với nội dung vừa nhập"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Cập nhật</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLiveWebPreview}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition-colors cursor-pointer"
                    title="Mở toàn màn hình"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở rộng</span>
                  </button>
                </div>
              </div>

              <div className="relative w-full aspect-[4/5] sm:aspect-[10/11] rounded-2xl overflow-hidden border border-border/70 bg-[#060411] shadow-inner">
                <iframe
                  key={`${selectedTemplate.slug}-${previewVersion}`}
                  src={`/love-gift/${selectedTemplate.slug}?preview=1&draft=1`}
                  title="Xem trước Thiệp 3D Vũ Trụ"
                  className="w-full h-full border-0"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {activeCuratedModel.icon} {activeCuratedModel.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold">
                  {activeCosmicBg.icon} {activeCosmicBg.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-semibold">
                  {activeFormation.icon} {activeFormation.name}
                </span>
              </div>
            </div>

            {/* 2. Thông tin Sản phẩm vật lý Handmade + Giá tổng hợp */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 shadow-soft border border-white/40 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-border/60 bg-muted">
                  {from3d && modelUrl ? (
                    <model-viewer
                      src={modelUrl}
                      auto-rotate
                      camera-controls
                      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                    />
                  ) : (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    <Gift className="w-3 h-3" />
                    Sản phẩm Handmade đã chọn
                  </span>
                  <h3 className="text-base font-bold text-foreground truncate mt-1">
                    {from3d && customName ? customName : product.name}
                  </h3>
                  <div className="text-sm font-bold text-rose-600 mt-0.5">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>

              {/* Số lượng đặt */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-card/60 border border-border/60">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Số lượng sản phẩm:
                  </span>
                  {isPhysical && (product as unknown as { stock?: number })?.stock !== undefined && (
                    <span className="text-[11px] text-muted-foreground">
                      Kho còn: <strong>{(product as unknown as { stock?: number }).stock}</strong> sản phẩm
                    </span>
                  )}
                </div>
                <div className="flex items-center bg-white dark:bg-background rounded-xl border border-primary/20 overflow-hidden h-8">
                  <button
                    type="button"
                    onClick={handleGreetingDecrease}
                    disabled={quantity <= 1 || isGreetingOutOfStock}
                    className="w-8 h-full flex items-center justify-center hover:bg-primary/10 text-primary font-bold transition-colors cursor-pointer disabled:opacity-40"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={greetingMaxStock ?? 9999}
                    value={quantity}
                    onChange={(e) => handleGreetingQuantityChange(e.target.value)}
                    className="w-10 text-center text-xs font-bold text-primary bg-transparent border-0 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGreetingIncrease}
                    disabled={greetingMaxStock !== undefined && quantity >= greetingMaxStock}
                    className="w-8 h-full flex items-center justify-center hover:bg-primary/10 text-primary font-bold transition-colors cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Chi tiết giá combo (bao gồm phụ phí ảnh vượt quá 5 ảnh) */}
              <div className="pt-2 border-t border-border/50 space-y-1.5 text-xs">
                {isPhysical && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Giá sản phẩm Handmade:</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Thiệp 3D NFC đi kèm (Miễn phí {FREE_PHOTO_LIMIT} ảnh):</span>
                  <span>+{formatPrice(calculatePricing.baseCardPrice)}</span>
                </div>
                {calculatePricing.extraPhotoCount > 0 && (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>
                      Phụ phí thêm ảnh ({calculatePricing.extraPhotoCount} ảnh × 5.000đ):
                    </span>
                    <span>+{formatPrice(calculatePricing.extraPhotoFee)}</span>
                  </div>
                )}
                <div className="border-t border-border/50 pt-2 flex justify-between items-center font-bold text-foreground text-sm">
                  <span>Tổng cộng ({quantity} bộ):</span>
                  <span className="text-lg font-extrabold text-primary">
                    {formatPrice(calculatePricing.totalItemPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (7 phần): CẤU HÌNH TOÀN DIỆN THIỆP 3D DUY NHẤT */}
          <div className="lg:col-span-7 space-y-6">
            {/* KHỐI 1: CHỌN MODEL 3D TRUNG TÂM & BACKGROUND VŨ TRỤ 3D */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-soft border border-white/40 space-y-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1">
                  <Box className="w-3.5 h-3.5" />
                  1. Chọn Model 3D Trung tâm & Không gian Vũ trụ
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">
                  Mô hình 3D do hệ thống tuyển chọn & Nền vũ trụ có chiều sâu
                </h2>
              </div>

              {/* Danh sách Model 3D do chủ hệ thống cung cấp */}
              <div className="space-y-2.5">
                <label className="block text-xs sm:text-sm font-bold text-foreground">
                  Chọn Mô hình 3D xuất hiện ở tâm điểm thiệp ({ENABLED_CURATED_MODELS.length} mô hình hệ thống):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ENABLED_CURATED_MODELS.map((model) => {
                    const isSelected = model.id === sceneModelId;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSceneModelId(model.id);
                          setAccentColor(model.defaultColor);
                        }}
                        className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                            : "border-border/60 bg-white/70 dark:bg-card/60 hover:bg-muted/60"
                        }`}
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{model.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {model.name}
                            </span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {model.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chọn Background Vũ trụ có chiều sâu */}
              <div className="space-y-2.5 pt-3 border-t border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs sm:text-sm font-bold text-foreground">
                    Chọn Background 3D chiều sâu Vũ trụ ({COSMIC_BACKGROUNDS.length} chủ đề):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">
                      Màu ánh sáng tinh vân:
                    </span>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent"
                      title="Tùy chỉnh màu tinh vân vũ trụ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {COSMIC_BACKGROUNDS.map((bg) => {
                    const isSelected = bg.id === bgStyleId;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => {
                          setBgStyleId(bg.id);
                          setBgColor(bg.nebulaPrimary);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                            : "border-border/60 bg-white/70 dark:bg-card/60 hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{bg.icon}</span>
                          <span
                            className="w-4 h-4 rounded-full border border-white/40"
                            style={{
                              background: `linear-gradient(135deg, ${bg.nebulaPrimary}, ${bg.nebulaSecondary})`,
                            }}
                          />
                        </div>
                        <p className="text-xs font-bold text-foreground mt-1.5">{bg.name}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                          {bg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* KHỐI 2: LỜI MỞ ĐẦU THIỆP & NỘI DUNG LÁ THƯ */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-soft border border-white/40 space-y-5">
              <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1">
                    2. Lời mở đầu thiệp & Nội dung Lá thư
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">
                    Tùy chỉnh mọi lời dẫn và tâm thư theo ý của bạn
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAIHelper((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-xs hover:scale-105 transition-transform cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {showAIHelper ? "Ẩn trợ lý AI" : "Dùng AI gợi ý lời chúc"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-foreground">
                    Tên người nhận <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Bảo Ngọc, Mẹ yêu, Anh Tuấn..."
                    value={recipientName}
                    onChange={(e) => {
                      setRecipientName(e.target.value);
                      store.setField("receiverName", e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-white/80 dark:bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-foreground">
                    Tên / Chữ ký người gửi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Minh Tuấn, Con của mẹ, Người thương..."
                    value={senderName}
                    onChange={(e) => {
                      setSenderName(e.target.value);
                      store.setField("senderName", e.target.value);
                    }}
                    className="w-full rounded-xl border border-border bg-white/80 dark:bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-foreground">
                    Tiêu đề mở màn Thiệp 3D
                  </label>
                  <input
                    type="text"
                    placeholder="Một Món Quà Nhỏ Giữa Vũ Trụ"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/80 dark:bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-foreground">
                    Lời mở đầu thiệp (Hiện ở màn hình chào & cảnh mở màn)
                  </label>
                  <input
                    type="text"
                    placeholder="Giữa hàng triệu vì sao, món quà này dành riêng cho bạn"
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/80 dark:bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-foreground">
                    Tiêu đề lá thư
                  </label>
                  <input
                    type="text"
                    placeholder="Gửi người đặc biệt của tôi"
                    value={letterTitle}
                    onChange={(e) => setLetterTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/80 dark:bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-foreground">
                    Dòng kết lá thư
                  </label>
                  <input
                    type="text"
                    placeholder="Với tất cả yêu thương"
                    value={closingText}
                    onChange={(e) => setClosingText(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/80 dark:bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {showAIHelper && (
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-card/60 border border-rose-200/60">
                  <AIGiftWidget
                    receiverName={recipientName}
                    senderName={senderName}
                    value={message}
                    onChange={setMessage}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-foreground">
                    Nội dung lời chúc trong Lá thư <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {message.length}/5000 ký tự
                  </span>
                </div>
                <textarea
                  rows={5}
                  maxLength={5000}
                  placeholder={selectedTemplate.rawTemplate.message}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-white/80 dark:bg-background p-3.5 text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                />
              </div>
            </div>

            {/* KHỐI 3: HÌNH ẢNH KỶ NIỆM (MIỄN PHÍ 5 ẢNH, +5.000Đ/ẢNH THÊM) & 8 KIỂU TRÌNH BÀY 3D */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-soft border border-white/40 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-xs font-bold mb-1">
                    <Orbit className="w-3.5 h-3.5" />
                    3. Hình ảnh Kỷ niệm & Cách trình bày 3D quanh Lá thư
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">
                    Miễn phí {FREE_PHOTO_LIMIT} ảnh đầu tiên · Thêm ảnh thứ 6 trở đi: +5.000đ/ảnh
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    💡 <strong>1–2 ảnh đầu tiên</strong> sẽ xuất hiện ngay lúc mở thiệp 3D; sau đó <strong>tất cả các ảnh</strong> sẽ xoay vòng quanh lá thư ở cảnh cuối.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-95 font-bold text-xs cursor-pointer transition-all shrink-0 self-start sm:self-auto shadow-xs">
                  <ImageIcon className="w-4 h-4" />
                  <span>+ Tải ảnh lên ({photos.length}/{MAX_CARD_PHOTOS})</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={isUploadingMedia}
                    onChange={handlePhotosUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Thanh trạng thái số lượng ảnh & phụ phí */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/60 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    Đã chọn: {photos.length} ảnh
                  </span>
                  <span className="text-muted-foreground">
                    ({Math.min(photos.length, FREE_PHOTO_LIMIT)}/{FREE_PHOTO_LIMIT} ảnh miễn phí)
                  </span>
                </div>
                {extraPhotoPricing.extraCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                    +{extraPhotoPricing.extraCount} ảnh thêm (+
                    {formatPrice(extraPhotoPricing.extraFee)})
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold">
                    Đang trong gói {FREE_PHOTO_LIMIT} ảnh miễn phí
                  </span>
                )}
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photos.map((src, idx) => {
                    const isExtra = idx >= FREE_PHOTO_LIMIT;
                    return (
                      <div
                        key={idx}
                        className={`group relative aspect-square rounded-2xl overflow-hidden border bg-muted shadow-xs ${
                          isExtra ? "border-amber-500/50" : "border-border"
                        }`}
                      >
                        <img
                          src={src}
                          alt={`Ảnh kỷ niệm ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${
                              idx < 2
                                ? "bg-rose-600/90"
                                : isExtra
                                ? "bg-amber-600/90"
                                : "bg-black/70"
                            }`}
                          >
                            {idx < 2
                              ? `Ảnh mở màn #${idx + 1}`
                              : isExtra
                              ? `Ảnh #${idx + 1} (+5k)`
                              : `Ảnh #${idx + 1}`}
                          </span>
                        </div>
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMovePhoto(idx, -1)}
                              className="px-1.5 py-1 rounded-md bg-black/65 hover:bg-black text-white text-[10px] font-bold cursor-pointer"
                              title="Đưa lên trước"
                            >
                              ←
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="p-1.5 rounded-full bg-black/65 hover:bg-red-600 text-white transition-colors cursor-pointer"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border/70 bg-white/40 dark:bg-card/40 p-5 text-center text-xs text-muted-foreground">
                  Chưa có ảnh kỷ niệm nào. Bấm <strong>&ldquo;+ Tải ảnh lên&rdquo;</strong> để đưa 1–2 ảnh mở màn và bộ ảnh xoay quanh lá thư vào không gian 3D.
                </div>
              )}

              {/* Chọn 1 trong 8 cách trình bày ảnh xoay quanh lá thư */}
              <div className="space-y-2.5 pt-3 border-t border-border/40">
                <label className="block text-xs sm:text-sm font-bold text-foreground">
                  Chọn cách trình bày & chuyển động của Hình ảnh quanh Lá thư (8 kiểu 3D):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PHOTO_FORMATIONS.map((fmt) => {
                    const isSelected = fmt.id === photoFormationId;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setPhotoFormationId(fmt.id)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/30"
                            : "border-border/60 bg-white/70 dark:bg-card/60 hover:bg-muted/60"
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{fmt.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                              {fmt.name}
                            </span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {fmt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* KHỐI 4: ÂM NHẠC XUYÊN SUỐT & GHI ÂM GIỌNG NÓI KHI CHẠM MODEL 3D */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-soft border border-white/40 space-y-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1">
                  4. Âm nhạc xuyên suốt & Ghi âm Giọng nói của bạn
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">
                  Nhạc nền tự động nhỏ lại khi phát đoạn ghi âm giọng nói
                </h2>
              </div>

              {/* Phần 4A: Ghi âm giọng nói + Văn bản xuất hiện từng chữ cái */}
              <VoiceRecorderField
                value={voiceData}
                onChange={(dataUrl) => setVoiceData(dataUrl)}
                voiceText={voiceText}
                onVoiceTextChange={setVoiceText}
                disabled={isUploadingMedia}
              />

              {/* Phần 4B: Nhạc nền phát từ đầu đến cuối */}
              <div className="pt-3 border-t border-border/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Music className="w-4 h-4 text-amber-500" />
                      Nhạc nền phát xuyên suốt từ đầu đến cuối
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hỗ trợ MP3, WAV, OGG, M4A (tối đa 8 MB). Nhạc sẽ tự động hạ nhỏ âm lượng khi giọng nói của bạn vang lên.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold text-xs cursor-pointer transition-colors shrink-0 self-start sm:self-auto">
                    <Music className="w-4 h-4" />
                    <span>{audioData ? "Đổi nhạc nền" : "+ Chọn file nhạc nền"}</span>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,.mp3,.wav,.ogg,.m4a"
                      disabled={isUploadingMedia}
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {audioData ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                    <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                      <Music className="w-5 h-5 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-foreground truncate">
                        {audioFileName || "Nhạc nền tùy chỉnh đã tải lên"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <audio controls src={audioData} className="h-9 max-w-[220px]" />
                      <button
                        type="button"
                        onClick={() => {
                          setAudioData("");
                          setAudioFileName("");
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-semibold cursor-pointer shrink-0"
                        title="Gỡ nhạc nền"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-border/70 bg-white/40 dark:bg-card/40 p-4 text-center text-xs text-muted-foreground">
                    Chưa chèn nhạc nền riêng. Bạn có thể chọn một bản nhạc MP3/WAV/M4A yêu thích để phát xuyên suốt thiệp.
                  </div>
                )}
              </div>
            </div>

            {/* KHỐI 5: TÙY CHỈNH PHONG THƯ & MÀU SẮC 3D */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-soft border border-white/40 space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  5. Tùy chỉnh Phong thư & Màu sắc 3D
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Màu chủ đạo 3D
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-white/80 dark:bg-background px-2.5 py-1.5">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-foreground">{accentColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Màu phong thư
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-white/80 dark:bg-background px-2.5 py-1.5">
                    <input
                      type="color"
                      value={envelopeColor}
                      onChange={(e) => setEnvelopeColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-foreground">{envelopeColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Dấu niêm phong
                  </label>
                  <select
                    value={sealType}
                    onChange={(e) => setSealType(e.target.value)}
                    className="w-full h-[42px] rounded-xl border border-border bg-white/80 dark:bg-background px-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="Trái tim">❤️ Trái tim</option>
                    <option value="Ngôi sao">⭐ Ngôi sao</option>
                    <option value="Bông hoa">🌸 Bông hoa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Chữ ngoài phong thư
                  </label>
                  <input
                    type="text"
                    value={envelopeLabel}
                    onChange={(e) => setEnvelopeLabel(e.target.value)}
                    placeholder="Dành riêng cho bạn"
                    className="w-full h-[42px] rounded-xl border border-border bg-white/80 dark:bg-background px-2.5 text-xs text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            {/* THANH NÚT HÀNH ĐỘNG CUỐI TRANG */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 shadow-soft border border-white/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <Eye className="w-4 h-4" />
                Xem tóm tắt thiệp
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold border border-border bg-card hover:bg-muted transition-colors text-foreground flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  {editCartItemId ? "Cập nhật giỏ hàng" : "Thêm vào giỏ hàng"}
                </button>

                <button
                  type="button"
                  onClick={handleDirectCheckout}
                  className="w-full sm:w-auto btn-hero px-7 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-coral-glow cursor-pointer text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  Thanh toán ngay ({formatPrice(calculatePricing.totalItemPrice)})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Xem trước tóm tắt thông điệp thiệp */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-card border-primary/20 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-xs">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold font-display text-foreground">
              Xem trước cấu hình Thiệp 3D Vũ Trụ
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Kiểm tra lại thông tin trước khi mở toàn màn hình 3D hoặc thanh toán.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/60 dark:from-muted/40 dark:to-muted/20 border border-primary/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/60 shrink-0">
                  <img
                    src={isPhysical ? product?.image : selectedTemplate.image}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">
                    {isPhysical ? product?.name : selectedTemplate.title}
                  </h4>
                  <span className="text-[11px] font-semibold text-primary">
                    {activeCuratedModel.icon} {activeCuratedModel.name} · {activeCosmicBg.icon}{" "}
                    {activeCosmicBg.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-rose-600 block">
                  {formatPrice(calculatePricing.unitPrice)}
                </span>
                {isPhysical && (
                  <span className="text-[10px] text-muted-foreground block">
                    (SP {formatPrice(product?.price || 0)} + Thiệp{" "}
                    {formatPrice(calculatePricing.cardPrice)})
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/70 dark:bg-card/70 p-3 rounded-xl border border-border/50">
              <div>
                <span className="text-muted-foreground text-[10px] block uppercase font-bold">
                  Người nhận:
                </span>
                <span className="font-bold text-foreground text-sm">
                  {recipientName || store.receiverName || "Người thương"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block uppercase font-bold">
                  Người gửi:
                </span>
                <span className="font-bold text-foreground text-sm">
                  {senderName || store.senderName || "Bạn"}
                </span>
              </div>
            </div>

            {voiceData && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                <span className="font-bold text-rose-600 block">
                  🎙️ Đã đính kèm Ghi âm Giọng nói (Phát khi chạm Model 3D)
                </span>
                {voiceText && (
                  <p className="italic text-muted-foreground">&ldquo;{voiceText}&rdquo;</p>
                )}
              </div>
            )}

            <div className="p-4 rounded-xl bg-white dark:bg-card border border-rose-200/60 dark:border-rose-900/30 text-center relative overflow-hidden">
              <p className="text-sm font-serif italic text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed px-4 py-1">
                {message || selectedTemplate.rawTemplate.message}
              </p>
            </div>

            {photos.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground block">
                  {photos.length} ảnh kỷ niệm ({activeFormation.icon} {activeFormation.name})
                </span>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {photos.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleLiveWebPreview}
              className="py-3 px-4 rounded-xl font-bold border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              Mở toàn màn hình 3D
            </button>
            <button
              onClick={handleDirectCheckout}
              className="py-3 px-4 rounded-xl font-bold btn-hero text-black shadow-coral-glow hover:scale-[1.02] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Thanh toán ({formatPrice(calculatePricing.totalItemPrice)})
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
