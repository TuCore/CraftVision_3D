"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Gift, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useTranslation } from "@/components/LanguageProvider";
import type { BlogArticle, BlogSummary } from "./types";

const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

function ArticleCards({ articles }: { articles: BlogSummary[] }) {
  const { language } = useTranslation();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => {
        const copy = article[language];
        return (
          <Link key={article.slug} href={`/blog/${article.slug}`} className={`group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${focusStyle}`}>
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f8eee7]">
              <Image src={article.image} alt={copy.imageAlt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className={`${article.imageFit === "contain" ? "object-contain p-5" : "object-cover"} transition duration-500 group-hover:scale-105`} />
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{copy.category}</p>
              <h3 className="mt-3 text-xl font-bold leading-snug text-foreground">{copy.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {language === "vi" ? "Đọc bài viết" : "Read article"}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function BlogIndexView({ articles }: { articles: BlogSummary[] }) {
  const { language } = useTranslation();
  const vi = language === "vi";
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl py-4 sm:py-8">
        <Link href="/home" className={`inline-flex items-center gap-2 rounded text-sm font-medium text-muted-foreground hover:text-primary ${focusStyle}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />{vi ? "Trang chủ" : "Home"}
        </Link>
        <header className="max-w-3xl py-10 sm:py-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary"><BookOpen className="h-4 w-4" aria-hidden="true" />CraftVision 3D Journal</p>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl">{vi ? "Mỗi món quà, một câu chuyện" : "Every gift tells a story"}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{vi ? "Ý tưởng gửi yêu thương, cách chia sẻ thiệp và những trải nghiệm đang có trên CraftVision 3D." : "Thoughtful gift ideas, greeting guides and experiences available on CraftVision 3D."}</p>
        </header>
        <section aria-labelledby="articles-heading"><h2 id="articles-heading" className="sr-only">{vi ? "Các bài viết" : "Articles"}</h2><ArticleCards articles={articles} /></section>
      </div>
    </AppShell>
  );
}

export function BlogArticleView({ article, related }: { article: BlogArticle; related: BlogSummary[] }) {
  const { language } = useTranslation();
  const vi = language === "vi";
  const copy = article[language];
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl py-4 sm:py-8">
        <nav aria-label={vi ? "Đường dẫn trang" : "Breadcrumb"} className="mb-7 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/home" className={`rounded hover:text-primary ${focusStyle}`}>{vi ? "Trang chủ" : "Home"}</Link></li>
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li><Link href="/blog" className={`rounded hover:text-primary ${focusStyle}`}>{vi ? "Góc cảm hứng" : "Journal"}</Link></li>
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li aria-current="page" className="font-medium text-foreground">{copy.category}</li>
          </ol>
        </nav>

        <article className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-sm">
          <figure>
            <div className={`relative aspect-[4/3] sm:aspect-[16/8] ${article.imageFit === "contain" ? "bg-[#f8eee7]" : "bg-[#1b0b21]"}`}>
              <Image src={article.image} alt={copy.imageAlt} fill priority sizes="(max-width: 1199px) 100vw, 1152px" className={article.imageFit === "contain" ? "object-contain p-8 sm:p-10" : "object-cover"} />
            </div>
            <figcaption className="border-b border-border/60 px-6 py-3 text-center text-xs leading-5 text-muted-foreground sm:px-10">{copy.imageCaption}</figcaption>
          </figure>

          <div className="mx-auto max-w-4xl p-6 sm:p-10 lg:p-14">
            <header>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Sparkles className="h-4 w-4" aria-hidden="true" />{copy.category}</p>
              <h1 className="mt-5 text-balance font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">{copy.title}</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">{copy.description}</p>
              <p className="mt-5 text-xs font-semibold tracking-wide text-muted-foreground">{vi ? "Biên soạn bởi CraftVision 3D" : "By CraftVision 3D"}</p>
            </header>

            <div className="mt-10 space-y-10 border-t border-border/70 pt-10">
              <aside className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                <nav aria-label={vi ? "Mục lục bài viết" : "Table of contents"}>
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground"><BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />{vi ? "Trong bài viết này" : "In this article"}</p>
                  <ol className="mt-4 space-y-3">
                    {copy.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className={`flex gap-3 rounded text-sm leading-6 text-muted-foreground hover:text-primary ${focusStyle}`}><span className="font-semibold text-primary" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{section.title}</a></li>)}
                  </ol>
                </nav>
              </aside>

              <div className="min-w-0 space-y-10">
                {copy.sections.map((section) => (
                  <section id={section.id} key={section.id} className="scroll-mt-28">
                    <h2 className="text-2xl font-bold leading-snug text-foreground">{section.title}</h2>
                    <div className="mt-4 space-y-4 text-base leading-8 text-foreground/80">
                      {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                    {section.steps && <ol className="mt-6 space-y-4">{section.steps.map((step, index) => <li key={index} className="flex gap-4 rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-label={vi ? `Bước ${index + 1}` : `Step ${index + 1}`}>{index + 1}</span><p className="pt-0.5 text-base leading-7 text-foreground/80">{step}</p></li>)}</ol>}
                  </section>
                ))}
              </div>
            </div>

            <section className="mt-12 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-6 sm:p-8" aria-label={vi ? "Tiếp tục khám phá" : "Explore more"}>
              <Gift className="h-7 w-7 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-bold text-foreground">{vi ? "Viết tiếp câu chuyện món quà của bạn" : "Continue your gifting story"}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{vi ? "Xem quà handmade trong cửa hàng, tiếp tục với thiệp đã lưu hoặc trao đổi ý tưởng cùng Vision Plus." : "Visit the handmade shop, continue a saved card or discuss gift ideas with Vision Plus."}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/shop" className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 ${focusStyle}`}>{vi ? "Ghé cửa hàng" : "Visit the shop"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link href="/cards/mine" className={`inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/50 ${focusStyle}`}>{vi ? "Thiệp của tôi" : "My cards"}</Link>
                <Link href="/chat" className={`inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/50 ${focusStyle}`}>Vision Plus</Link>
              </div>
            </section>
          </div>
        </article>

        <section className="mt-14" aria-labelledby="related-articles-heading">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 id="related-articles-heading" className="text-2xl font-bold">{vi ? "Đọc thêm câu chuyện khác" : "More stories to explore"}</h2>
            <Link href="/blog" className={`inline-flex items-center gap-2 rounded text-sm font-semibold text-primary ${focusStyle}`}>{vi ? "Tất cả bài viết" : "All articles"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <ArticleCards articles={related} />
        </section>
      </div>
    </AppShell>
  );
}
