import type { Metadata } from "next";
import PublicCard from "@/features/cards/PublicCard";
export const metadata: Metadata = { title: "Một món quà dành cho bạn", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function SharedCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PublicCard key={token} token={token} />;
}
