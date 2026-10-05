import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import "@/features/cards/workspace.css";

export default function CardsLayout({ children }: { children: ReactNode }) {
  return <AppShell active="love-gift"><div className="cards-system">{children}</div></AppShell>;
}
