"use client";

import { AppShell } from "@/components/AppShell";
import { ScrollytellingHero } from "@/components/home/ScrollytellingHero";
import { TemplateProductsSection } from "@/components/home/TemplateProductsSection";

export default function HomePage() {
  return (
    <AppShell active="home">
      {/* 1. Scrollytelling 3D Gift Box Hero Section */}
      <ScrollytellingHero />

      {/* 2. Template Products Section */}
      <TemplateProductsSection />
    </AppShell>
  );
}
