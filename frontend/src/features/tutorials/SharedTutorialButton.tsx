"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { TutorialVideoModal } from "@/components/home/TutorialVideoModal";
import { useTranslation } from "@/components/LanguageProvider";
import { tutorialRequest } from "./api";
import { TUTORIAL_QUERY_KEY } from "./types";
import { useTutorialVideo } from "./useTutorialVideo";

export function SharedTutorialButton({ productTitle, className = "" }: { productTitle?: string; className?: string }) {
  const { t, language } = useTranslation();
  const query = useTutorialVideo();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function show() {
    setBusy(true);
    try {
      // Recheck on every opening so an already-open page respects an admin removal or edit.
      const current = await client.fetchQuery({ queryKey: TUTORIAL_QUERY_KEY, queryFn: ({ signal }) => tutorialRequest({ signal }), staleTime: 0 });
      setOpen(!!current.video);
      if (!current.video) toast.info(language === "vi" ? "Video hướng dẫn đang được cập nhật." : "The tutorial is being updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được video hướng dẫn.");
    } finally { setBusy(false); }
  }

  if (query.isPending || (!query.isError && !query.data?.video)) return null;
  return <>
    <button type="button" onClick={show} disabled={busy}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50 ${className}`}>
      <PlayCircle className="h-4 w-4" />
      {query.isError ? (language === "vi" ? "Tải lại video hướng dẫn" : "Retry tutorial") : t("template.tutorial_video")}
    </button>
    <TutorialVideoModal isOpen={open && !!query.data?.video} onClose={() => setOpen(false)}
      video={query.data?.video ?? null} productTitle={productTitle} />
  </>;
}
