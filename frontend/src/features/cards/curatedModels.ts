export interface Curated3DModel {
  id: string;
  name: string;
  category: string;
  icon: string;
  modelUrl: string;
  fallbackModelKey: string;
  targetSize: number;
  positionY: number;
  rotationSpeed: number;
  defaultColor: string;
  description: string;
  isEnabled: boolean;
}

/**
 * Danh mục Model 3D chuẩn do Chủ hệ thống (Owner/Admin) cung cấp.
 * Để thêm model 3D mới vào hệ thống:
 * 1. Đặt file .glb vào thư mục `frontend/public/models/`
 * 2. Thêm cấu hình vào mảng CURATED_3D_MODELS bên dưới với `isEnabled: true`.
 */
export const CURATED_3D_MODELS: Curated3DModel[] = [
  {
    id: "rose-bouquet",
    name: "Bó Hoa Hồng Vĩnh Cửu",
    category: "Tình yêu & Kỷ niệm",
    icon: "🌹",
    modelUrl: "/models/rose_bouquet.glb",
    fallbackModelKey: "rose",
    targetSize: 2.35,
    positionY: -0.25,
    rotationSpeed: 0.35,
    defaultColor: "#ef476f",
    description: "Bó hoa hồng 3D nở rộ tượng trưng cho tình cảm chân thành và vĩnh cửu.",
    isEnabled: true,
  },
  {
    id: "birthday-cake",
    name: "Bánh Kem Sinh Nhật Cherry",
    category: "Sinh nhật & Chúc mừng",
    icon: "🎂",
    modelUrl: "/models/banhsinhnhatcheery.optimized.glb",
    fallbackModelKey: "cake",
    targetSize: 2.3,
    positionY: -0.35,
    rotationSpeed: 0.32,
    defaultColor: "#f78ca2",
    description: "Chiếc bánh kem 3D ngọt ngào mang theo ngàn điều ước tuổi mới.",
    isEnabled: true,
  },
  {
    id: "origami-heart",
    name: "Trái Tim Pha Lê Origami",
    category: "Tỏ tình & Lãng mạn",
    icon: "💖",
    modelUrl: "/models/origami_heart.glb",
    fallbackModelKey: "lock",
    targetSize: 2.15,
    positionY: 0.05,
    rotationSpeed: 0.42,
    defaultColor: "#ff4d79",
    description: "Trái tim 3D đa diện lấp lánh giữa không gian vũ trụ.",
    isEnabled: true,
  },
  {
    id: "amigurumi",
    name: "Thú Bông Len Handmade",
    category: "Đáng yêu & Tri ân",
    icon: "🧸",
    modelUrl: "/models/amigurumi.glb",
    fallbackModelKey: "bear",
    targetSize: 2.2,
    positionY: -0.3,
    rotationSpeed: 0.3,
    defaultColor: "#f4a261",
    description: "Bạn nhỏ thủ công ấm áp mang lời nhắn dịu dàng tới người thương.",
    isEnabled: true,
  },
  {
    id: "scented-candle",
    name: "Nến Thơm Ánh Sáng Ấm Áp",
    category: "Bình yên & Chữa lành",
    icon: "🕯️",
    modelUrl: "/models/candle.glb",
    fallbackModelKey: "star-lantern",
    targetSize: 2.1,
    positionY: -0.35,
    rotationSpeed: 0.28,
    defaultColor: "#f6bd60",
    description: "Ngọn nến ấm áp thắp sáng không gian đêm đầy sao.",
    isEnabled: true,
  },
  {
    id: "memory-bracelet",
    name: "Vòng Tay Gắn Kết Kỷ Niệm",
    category: "Quà tặng & Gắn kết",
    icon: "💍",
    modelUrl: "/models/bracelet.glb",
    fallbackModelKey: "ring",
    targetSize: 2.15,
    positionY: 0.0,
    rotationSpeed: 0.38,
    defaultColor: "#e9c46a",
    description: "Biểu tượng của sự gắn kết bền chặt vượt qua thời gian.",
    isEnabled: true,
  },
  {
    id: "gift-box",
    name: "Hộp Quà Bí Mật Ánh Sao",
    category: "Mọi dịp đặc biệt",
    icon: "🎁",
    modelUrl: "/Box.glb",
    fallbackModelKey: "bear",
    targetSize: 2.1,
    positionY: -0.25,
    rotationSpeed: 0.35,
    defaultColor: "#c77dff",
    description: "Hộp quà 3D chứa đựng thanh âm và tâm thư bất ngờ bên trong.",
    isEnabled: true,
  },
];

export const ENABLED_CURATED_MODELS = CURATED_3D_MODELS.filter((m) => m.isEnabled);

export function getCuratedModel(idOrLabel?: string): Curated3DModel {
  if (!idOrLabel) return ENABLED_CURATED_MODELS[0];
  return (
    ENABLED_CURATED_MODELS.find(
      (m) => m.id === idOrLabel || m.name === idOrLabel
    ) || ENABLED_CURATED_MODELS[0]
  );
}

export interface CosmicBackgroundPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  deepColor: string;
  nebulaPrimary: string;
  nebulaSecondary: string;
  starColor: string;
  particleMode: "galaxy" | "nebula" | "meteor" | "rose-cosmos" | "golden-dust" | "aurora";
}

export const COSMIC_BACKGROUNDS: CosmicBackgroundPreset[] = [
  {
    id: "cosmic-galaxy",
    name: "Dải Ngân Hà & Tinh Vân Vũ Trụ",
    icon: "🌌",
    description: "Chiều sâu vũ trụ 3 tầng sao với dải ngân hà xoáy sáng và sao băng.",
    deepColor: "#060411",
    nebulaPrimary: "#7b2cbf",
    nebulaSecondary: "#3a0ca3",
    starColor: "#e0aaff",
    particleMode: "galaxy",
  },
  {
    id: "deep-nebula",
    name: "Đám Mây Tinh Vân Huyền Ảo",
    icon: "🪐",
    description: "Không gian tinh vân xanh tím sâu thẳm với các hạt năng lượng trôi nổi.",
    deepColor: "#040814",
    nebulaPrimary: "#4361ee",
    nebulaSecondary: "#7209b7",
    starColor: "#bde0fe",
    particleMode: "nebula",
  },
  {
    id: "meteor-night",
    name: "Đêm Mưa Sao Băng & Đom Đóm",
    icon: "🌠",
    description: "Bầu trời đêm sâu hút với những vệt sao băng bay chéo và đom đóm ấm áp.",
    deepColor: "#050716",
    nebulaPrimary: "#4cc9f0",
    nebulaSecondary: "#4895ef",
    starColor: "#fff3b0",
    particleMode: "meteor",
  },
  {
    id: "rose-cosmos",
    name: "Vũ Trụ Hồng Ánh Sao",
    icon: "🌸",
    description: "Không gian vũ trụ sắc hồng - tím mộng mơ với bụi kim cương lấp lánh.",
    deepColor: "#140510",
    nebulaPrimary: "#ff4d8d",
    nebulaSecondary: "#9d4edd",
    starColor: "#ffc2d1",
    particleMode: "rose-cosmos",
  },
  {
    id: "golden-universe",
    name: "Chân Trời Bụi Vàng Vĩnh Cửu",
    icon: "✨",
    description: "Chiều sâu không gian sang trọng với hàng ngàn hạt bụi vàng Bokeh 3D.",
    deepColor: "#110b04",
    nebulaPrimary: "#f4a261",
    nebulaSecondary: "#e76f51",
    starColor: "#ffe599",
    particleMode: "golden-dust",
  },
  {
    id: "aurora-space",
    name: "Cực Quang Vũ Trụ & Tinh Thể",
    icon: "❄️",
    description: "Dải sóng ánh sáng cực quang xanh ngọc uốn lượn giữa không gian sao.",
    deepColor: "#031214",
    nebulaPrimary: "#06d6a0",
    nebulaSecondary: "#118ab2",
    starColor: "#a8f9ff",
    particleMode: "aurora",
  },
];

export function getCosmicBackground(idOrName?: string): CosmicBackgroundPreset {
  if (!idOrName) return COSMIC_BACKGROUNDS[0];
  return (
    COSMIC_BACKGROUNDS.find(
      (b) => b.id === idOrName || b.name === idOrName
    ) || COSMIC_BACKGROUNDS[0]
  );
}

export interface PhotoFormationPreset {
  id: "sphere" | "floating-up" | "heart" | "star" | "film-strip" | "galaxy-spiral" | "saturn-ring" | "carousel-bloom";
  name: string;
  icon: string;
  description: string;
}

export const PHOTO_FORMATIONS: PhotoFormationPreset[] = [
  {
    id: "sphere",
    name: "Quả Cầu Hình Ảnh Xoay",
    icon: "🌐",
    description: "Các bức ảnh phân bổ thành quả cầu 3D xoay tròn bao quanh lá thư.",
  },
  {
    id: "floating-up",
    name: "Ảnh Bay Từ Dưới Lên",
    icon: "🎈",
    description: "Ảnh xuất hiện ngẫu nhiên từ dưới đi lên nhẹ nhàng như đèn trời kỷ niệm.",
  },
  {
    id: "heart",
    name: "Ghép Hình Trái Tim 3D",
    icon: "❤️",
    description: "Các bức ảnh tự động xếp theo đường viền Trái Tim 3D tỏa sáng quanh thư.",
  },
  {
    id: "star",
    name: "Ghép Hình Ngôi Sao 5 Cánh",
    icon: "⭐",
    description: "Các bức ảnh tạo thành chòm sao 5 cánh lấp lánh xoay nhẹ trong vũ trụ.",
  },
  {
    id: "film-strip",
    name: "Tấm Film Điện Ảnh Uốn Lượn",
    icon: "🎞️",
    description: "Khung ảnh mang viền cuộn phim cổ điển uốn lượn xoay vòng quanh lá thư.",
  },
  {
    id: "galaxy-spiral",
    name: "Vòng Xoắn Ngân Hà Kép",
    icon: "🧬",
    description: "Ảnh xếp thành dải xoắn ốc thiên hà từ thấp lên cao có chiều sâu 3D.",
  },
  {
    id: "saturn-ring",
    name: "Vành Đai Ánh Sáng Nghiêng",
    icon: "🪐",
    description: "Vòng quay ảnh nghiêng góc 18° như vành đai hành tinh ôm lấy lá thư.",
  },
  {
    id: "carousel-bloom",
    name: "Hoa Nở Bung Tỏa 360°",
    icon: "🌸",
    description: "Khi phong thư mở ra, các bức ảnh bung tỏa như cánh hoa rồi xoay tròn.",
  },
];

export function getPhotoFormation(idOrName?: string): PhotoFormationPreset {
  if (!idOrName) return PHOTO_FORMATIONS[0];
  return (
    PHOTO_FORMATIONS.find(
      (f) => f.id === idOrName || f.name === idOrName
    ) || PHOTO_FORMATIONS[0]
  );
}

/** Chính sách giá Hình ảnh kỷ niệm trên Thiệp 3D */
export const FREE_PHOTO_LIMIT = 5;
export const EXTRA_PHOTO_PRICE_VND = 5000;
export const MAX_CARD_PHOTOS = 20;

export function calculateExtraPhotoFee(photoCount: number): {
  freeCount: number;
  extraCount: number;
  extraFee: number;
} {
  const safeCount = Math.max(0, photoCount);
  const freeCount = Math.min(safeCount, FREE_PHOTO_LIMIT);
  const extraCount = Math.max(0, safeCount - FREE_PHOTO_LIMIT);
  return {
    freeCount,
    extraCount,
    extraFee: extraCount * EXTRA_PHOTO_PRICE_VND,
  };
}
