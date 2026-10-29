import type { BlogSlug } from "./topics";

export interface ArticleCopy {
  title: string;
  description: string;
  category: string;
  imageAlt: string;
  imageCaption: string;
  sections: {
    id: string;
    title: string;
    paragraphs: string[];
    steps?: string[];
  }[];
}

export interface BlogArticle {
  slug: BlogSlug;
  image: string;
  imageFit?: "contain";
  vi: ArticleCopy;
  en: ArticleCopy;
}

export type BlogSummary = Pick<BlogArticle, "slug" | "image" | "imageFit"> & {
  vi: Pick<ArticleCopy, "title" | "description" | "category" | "imageAlt">;
  en: Pick<ArticleCopy, "title" | "description" | "category" | "imageAlt">;
};
