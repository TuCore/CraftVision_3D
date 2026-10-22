import { notFound } from "next/navigation";
import { cardTemplates, defaultDraft } from "@/features/cards/catalog";
import CardViewer from "@/features/cards/CardViewer";
export default async function GiftTemplatePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const template = cardTemplates.find(card => card.slug === slug);
  if (!template) notFound();
  const readValue = (key: string) => typeof query[key] === "string" ? query[key] as string : undefined;
  const personalizedValues = {
    recipient: readValue("recipient"),
    sender: readValue("sender"),
    title: readValue("title"),
    message: readValue("message"),
    photo: readValue("photo"),
  };
  const hasPersonalization = Object.values(personalizedValues).some(Boolean);
  const initialDraft = hasPersonalization ? defaultDraft(template) : undefined;
  if (initialDraft) {
    for (const [key, value] of Object.entries(personalizedValues)) {
      if (value) initialDraft.values[key] = value;
    }
  }
  return <CardViewer key={`${slug}-${query.draft === "1"}`} template={template} useDraft={query.draft === "1"} embedded={query.preview === "1"} artwork={query.artwork === "1"} initialDraft={initialDraft} />;
}
