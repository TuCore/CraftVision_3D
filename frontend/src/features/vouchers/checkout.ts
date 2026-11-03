import type { OrderItem } from "@/store/useOrderStore";
import type { CheckoutItem, CheckoutRequest } from "./types";
import { legacyCardSlug } from "@/features/cards/legacy";

export interface CheckoutAddress { receiverName: string; phone: string; address: string; ward: string; district: string; province: string; }
export function buildCheckoutRequest(items: OrderItem[], address: CheckoutAddress, bankTransfer: boolean): CheckoutRequest {
  const physical = items.some(item => !item.product.is3D && !item.product.isDigital && item.product.category !== "Thiệp điện tử");
  return {
    pricingVersion: 1, receiverName: physical ? address.receiverName : "Khách hàng 3D",
    receiverPhone: physical ? address.phone : "0999999999",
    receiverAddress: physical ? [address.address, address.ward, address.district, address.province].filter(Boolean).join(", ") : "Online",
    paymentMethod: bankTransfer || !physical ? "BankTransfer" : "Cod",
    items: items.map(item => {
      const digital = Boolean(item.product.is3D || item.product.isDigital || item.product.category === "Thiệp điện tử");
      const rawModel = String(item.gift?.threeDModelUrl || "");
      const legacyId = Number(item.product.id);
      const slug = item.cardSlug || item.gift?.cardSlug || item.product.cardSlug || (rawModel.startsWith("slug:") ? rawModel.slice(5) : undefined) ||
        (digital && Number.isInteger(legacyId) && legacyId > 0 ? legacyCardSlug(legacyId) : undefined);
      const source = item.gift ?? (!digital ? { giftTitle: `Chứng nhận chế tác - ${item.product.name}`, senderName: "CraftVision 3D",
        receiverName: address.receiverName || "Chủ nhân sản phẩm", message: "Chứng nhận nguồn gốc và câu chuyện chế tác thủ công của sản phẩm.",
        messageSource: "System", theme: "craft-certificate", previewImageUrl: item.product.image } : null);
      const id = (item.product.id || "").replace(/-3d$/, "");
      const cardType: CheckoutItem["cardType"] = digital ? "digital" : !item.gift || item.gift.theme === "craft-certificate" ? "none" : slug ? "web_library_3d" : "default";
      return { productId: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : "00000000-0000-0000-0000-000000000000",
        quantity: item.quantity, wantNfc: !digital || Boolean(source), cardType, cardSlug: slug,
        gift: source ? { giftTitle: source.giftTitle || "Thiệp thông điệp", senderName: source.senderName || "Người gửi",
          receiverName: source.receiverName || address.receiverName || "Người nhận", message: source.message || "",
          messageSource: source.messageSource || "Manual", theme: source.theme || "sincere",
          threeDModelUrl: source.threeDModelUrl || null, previewImageUrl: source.previewImageUrl || null,
          threeDModelType: source.threeDModelType || "GLB", mediaFileIds: source.mediaFileIds || [] } : null };
    }),
  };
}
