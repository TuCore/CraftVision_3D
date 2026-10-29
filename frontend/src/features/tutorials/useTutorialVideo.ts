"use client";

import { useQuery } from "@tanstack/react-query";
import { tutorialRequest } from "./api";
import { TUTORIAL_QUERY_KEY } from "./types";

export function useTutorialVideo() {
  return useQuery({
    queryKey: TUTORIAL_QUERY_KEY,
    queryFn: ({ signal }) => tutorialRequest({ signal }),
    staleTime: 30_000,
    refetchOnWindowFocus: "always",
    retry: 1,
  });
}
