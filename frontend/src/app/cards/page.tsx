import CardGallery from "@/features/cards/CardGallery";
import { redirect } from "next/navigation";
import { CARD_CATALOG_VISIBLE } from "@/features/cards/visibility";

export const metadata = { title: "Thiệp cá nhân hóa | CraftVision" };
export default function CardsPage() {
  if (!CARD_CATALOG_VISIBLE) redirect("/home");
  return <CardGallery />;
}
