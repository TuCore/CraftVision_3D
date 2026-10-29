import type { Metadata } from "next";
import { blogArticles, summarizeArticle } from "@/features/blog/articles";
import { BlogIndexView } from "@/features/blog/BlogPages";

export const metadata: Metadata = {
  title: "Góc cảm hứng | CraftVision 3D",
  description: "Câu chuyện quà handmade, QR chia sẻ thiệp và trải nghiệm cá nhân hóa trên CraftVision 3D.",
};

export default function BlogPage() {
  return <BlogIndexView articles={blogArticles.map(summarizeArticle)} />;
}
