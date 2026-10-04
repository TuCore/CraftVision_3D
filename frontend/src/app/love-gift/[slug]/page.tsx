import { notFound } from "next/navigation";
import { cardTemplates } from "@/features/cards/catalog";
import CardViewer from "@/features/cards/CardViewer";
export default async function GiftTemplatePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const template = cardTemplates.find(card => card.slug === slug);
  if (!template) notFound();
  return <CardViewer key={`${slug}-${query.draft === "1"}`} template={template} useDraft={query.draft === "1"} embedded={query.preview === "1"} artwork={query.artwork === "1"} />;
}
