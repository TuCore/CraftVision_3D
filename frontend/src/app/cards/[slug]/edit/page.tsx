import { notFound } from "next/navigation";
import { cardTemplates } from "@/features/cards/catalog";
import CardEditor from "@/features/cards/CardEditor";
export default async function EditCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = cardTemplates.find(card => card.slug === slug);
  if (!template) notFound();
  return <CardEditor key={slug} template={template} />;
}
