import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogArticles, findBlogArticle, summarizeArticle } from "@/features/blog/articles";
import { BlogArticleView } from "@/features/blog/BlogPages";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return blogArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findBlogArticle(slug);
  if (!article) notFound();
  return {
    title: `${article.vi.title} | CraftVision 3D`,
    description: article.vi.description,
    openGraph: { title: article.vi.title, description: article.vi.description, type: "article" },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = findBlogArticle(slug);
  if (!article) notFound();
  const related = blogArticles.filter((candidate) => candidate.slug !== slug).slice(0, 3).map(summarizeArticle);
  return <BlogArticleView article={article} related={related} />;
}
