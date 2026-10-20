"use client";

/* eslint-disable @next/next/no-img-element -- Local uploaded data URLs and pre-rendered preview assets do not use the image optimizer. */

import { useRef, useState } from "react";
import Link from "next/link";
import { INITIAL_TEMPLATE_PRODUCTS } from "@/data/templateProducts";
import { cardTemplates, categories, type CardTemplate } from "./catalog";
import "./cards.css";

interface GalleryCard extends CardTemplate {
  catalogNumber: number;
  previewImage?: string;
  demoPath?: string;
  editorPath?: string;
}

const starlightTemplate = INITIAL_TEMPLATE_PRODUCTS[0];
const starlightDemoPath = `/greeting-card?title=${encodeURIComponent(starlightTemplate.title)}`;
const starlightCard: Omit<GalleryCard, "catalogNumber"> = {
  id: starlightTemplate.id,
  slug: "starlight-birthday",
  title: starlightTemplate.title,
  category: "Sinh nhật",
  model: "starlight-cake",
  action: "Chạm nhẹ mở phong thư và khám phá sân khấu bánh sinh nhật 3D",
  reveal: "Ngọn lửa hạt bập bùng, ảnh kỷ niệm bay quanh và pháo hoa điều ước",
  fields: [
    { key: "recipient", label: "Tên người nhận", type: "text", required: true },
    { key: "sender", label: "Tên người gửi", type: "text", required: true },
    { key: "message", label: "Lời chúc", type: "textarea", required: true },
    { key: "photo", label: "Ảnh kỷ niệm", type: "image" },
  ],
  color: "#e84f7a",
  background: "#100714",
  message: "Hãy ước một điều thật đẹp nhé!",
  previewImage: starlightTemplate.image,
  demoPath: starlightDemoPath,
  editorPath: `/shop/template-${starlightTemplate.id}/greeting`,
};
const galleryCards: GalleryCard[] = [starlightCard, ...cardTemplates].map((card, index) => ({
  ...card,
  catalogNumber: index + 1,
}));

export default function CardGallery() {
  const [category, setCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<GalleryCard | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const filtered = galleryCards.filter(card => (category === "Tất cả" || card.category === category) && `${card.title} ${card.category}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const close = () => { dialog.current?.close(); setPreview(null); opener.current?.focus(); };
  return <div className="cards-workspace"><header className="cards-top"><Link href="/home">← Trang chủ</Link><Link href="/cards/mine">Thiệp của tôi ☁</Link></header>
    <section className="gallery-intro"><p>{galleryCards.length} CÁCH GỬI MỘT ĐIỀU CHÂN THÀNH</p><h1>Một dịp đặc biệt.<br /><em>Một món quà chỉ dành cho bạn.</em></h1><p>Chọn câu chuyện, viết lời chúc và chạm vào những bất ngờ 3D. Mỗi mẫu có mô hình và những chi tiết cá nhân hóa riêng.</p></section>
    <div className="gallery-filters"><label htmlFor="card-search">Tìm thiệp<input id="card-search" type="search" placeholder="Sinh nhật, Trung thu, cảm ơn…" value={search} onChange={event => setSearch(event.target.value)} /></label><label htmlFor="card-category">Dịp tặng<select id="card-category" value={category} onChange={event => setCategory(event.target.value)}>{["Tất cả", ...categories].map(item => <option key={item}>{item}</option>)}</select></label><span role="status">{filtered.length} mẫu thiệp</span></div>
    <div className="cards-grid">{filtered.map(card => <article key={card.slug} className="template-card">
      <div className="template-art" style={{ background: `radial-gradient(ellipse at 50% 30%, ${card.color}55, ${card.background})` }}><span className="template-number">{String(card.catalogNumber).padStart(2, "0")}</span><img src={card.previewImage || `/cards/previews/${card.slug}.webp`} alt={`Mô hình ${card.title}`} loading="lazy" onError={event => { event.currentTarget.style.visibility = "hidden"; }} /><span className="template-category">{card.category}</span></div>
      <div className="template-copy"><h2>{card.title}</h2><p>{card.action}</p><small>{card.fields.length} chi tiết riêng · Phong thư lời chúc</small><div><button onClick={event => { opener.current = event.currentTarget; setPreview(card); dialog.current?.showModal(); }}>Xem demo</button><Link href={card.editorPath || `/cards/${card.slug}/edit`}>Cá nhân hóa →</Link></div></div>
    </article>)}</div>
    {!filtered.length && <p>Chưa tìm thấy mẫu phù hợp. Thử từ khóa hoặc dịp khác nhé.</p>}
    <dialog ref={dialog} className="gallery-dialog" onCancel={close} aria-labelledby="gallery-preview-title"><button className="letter-close" aria-label="Đóng xem mẫu" onClick={close}>×</button>{preview && <div className="gallery-demo-layout"><div className="phone-preview"><iframe title="Xem trước thiệp 3D trên điện thoại" src={preview.demoPath || `/love-gift/${preview.slug}?preview=1`} /></div><section><p>{preview.category}</p><h2 id="gallery-preview-title">{preview.title}</h2><p>{preview.action}</p><p>{preview.reveal}.</p><p>Thay tên, lời chúc, ảnh và các chi tiết riêng trước khi gửi tặng.</p><Link className="card-primary" href={preview.demoPath || `/love-gift/${preview.slug}`}>Xem trực tiếp ↗</Link><Link href={preview.editorPath || `/cards/${preview.slug}/edit`}>Cá nhân hóa mẫu này →</Link></section></div>}</dialog>
  </div>;
}
