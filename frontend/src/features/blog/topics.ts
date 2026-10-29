export const blogTopics = [
  { slug: "qr-tinh-yeu", translationKey: "footer.qr_love" },
  { slug: "cach-tao-qr-tinh-yeu", translationKey: "footer.how_to_create" },
  { slug: "ma-qr-to-tinh", translationKey: "footer.confession_qr" },
  { slug: "trai-tim-qr-3d", translationKey: "footer.heart_qr" },
  { slug: "phao-hoa-tinh-yeu", translationKey: "footer.fireworks" },
  { slug: "craftvision3d-la-gi", translationKey: "footer.what_is" },
] as const;

export type BlogSlug = (typeof blogTopics)[number]["slug"];
