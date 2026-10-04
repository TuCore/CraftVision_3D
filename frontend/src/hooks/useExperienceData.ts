"use client";

import { useState, useEffect } from 'react';
import { ExperienceData } from '@/types/experience';

interface UseExperienceDataResult {
  data: ExperienceData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * useExperienceData — Phase 8 (Backend Connection)
 *
 * Fetches experience data from the ASP.NET Core Gateway by slug.
 * Falls back to mock data during development when the API is unavailable.
 */
export function useExperienceData(slug: string): UseExperienceDataResult {
  const [data, setData] = useState<ExperienceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    async function fetchExperience() {
      setIsLoading(true);
      setError(null);

      try {
        // The Gateway API endpoint — matches the ASP.NET Core route
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const response = await fetch(`${apiBase}/api/experiences/${slug}`, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Experience not found (${response.status})`);
        }

        const json = await response.json();
        setData(mapApiResponseToExperienceData(json));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;

        // Dev fallback: use mock data so experience still renders without backend
        console.warn('[useExperienceData] API unavailable, using mock data.', err);
        setData(buildMockData(slug));
      } finally {
        setIsLoading(false);
      }
    }

    fetchExperience();

    return () => controller.abort();
  }, [slug]);

  return { data, isLoading, error };
}

// ─── Map raw API JSON → ExperienceData ────────────────────────────────────────
function mapApiResponseToExperienceData(json: Record<string, unknown>): ExperienceData {
  return {
    slug: String(json.slug ?? ''),
    template: (json.template as ExperienceData['template']) ?? 'sparkle-love',
    title: String(json.title ?? 'Món quà tình yêu lấp lánh'),
    recipientName: String(json.recipientName ?? 'Bạn'),
    senderName: json.senderName ? String(json.senderName) : undefined,
    message: String(json.message ?? ''),
    theme: (json.theme as ExperienceData['theme']) ?? 'romantic',
    musicUrl: json.musicUrl ? String(json.musicUrl) : undefined,
    createdAt: json.createdAt ? String(json.createdAt) : undefined,
  };
}

// ─── Mock data for dev / preview ──────────────────────────────────────────────
function buildMockData(slug: string): ExperienceData {
  return {
    slug,
    template: 'sparkle-love',
    title: 'Món quà tình yêu lấp lánh',
    recipientName: 'Minh',
    senderName: 'Tứ',
    message: 'Cảm ơn vì đã xuất hiện và làm bừng sáng cuộc đời mình.',
    theme: 'romantic',
  };
}
