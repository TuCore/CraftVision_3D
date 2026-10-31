import type { Metadata } from "next";
import ShowcaseExperience from "@/features/cards/showcase/ShowcaseExperience";

export const metadata: Metadata = {
  title: "CraftVision 3D Showcase — Tri Ân Thầy Cô & Giới Thiệu Đồ Án",
  description: "Trải nghiệm thiệp 3D đa chiều, hiệu ứng tương tác xúc giác, chuyển cảnh điện ảnh và mô hình Three.js sống động của dự án CraftVision 3D.",
  openGraph: {
    title: "CraftVision 3D Showcase — Tri Ân Thầy Cô & Giới Thiệu Đồ Án",
    description: "Trải nghiệm thiệp 3D đa chiều, hiệu ứng tương tác xúc giác và mô hình Three.js sống động.",
  },
};

export default function ShowcasePage() {
  return (
    <main className="w-full min-h-screen bg-black overflow-hidden select-none">
      <ShowcaseExperience />
    </main>
  );
}
