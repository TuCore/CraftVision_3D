"use client";

/* eslint-disable @next/next/no-img-element -- Local uploaded data URLs and pre-rendered preview assets do not use the image optimizer. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { commonFields, defaultDraft, fieldsFor, validateDraft, type CardField, type CardTemplate, type CardValue } from "./catalog";
import { importPhoto, importAudio, parseDraft, readDraft, saveDraft } from "./storage";
import { cardRequest, downloadDraft, uploadDraft, type ServerCard } from "./server";
import "./cards.css";

export default function CardEditor({ template }: { template: CardTemplate }) {
  const [draft, setDraft] = useState(() => defaultDraft(template));
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [serverCard, setServerCard] = useState<ServerCard | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [loginPath, setLoginPath] = useState(`/cards/${template.slug}/edit`);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setSignedIn(Boolean(localStorage.getItem("token")));
      setLoginPath(window.location.pathname + window.location.search);
      const id = new URLSearchParams(window.location.search).get("card");
      try {
        if (id) {
          const card = await cardRequest<ServerCard>(`/${encodeURIComponent(id)}`);
          if (card.draft.template !== template.slug) throw new Error("Thiệp này thuộc một mẫu khác. Hãy mở từ Thiệp của tôi.");
          const saved = await downloadDraft(card.draft);
          if (!cancelled) { setDraft(saved); setServerCard(card); setShareUrl(card.sharePath ? window.location.origin + card.sharePath : ""); }
        } else { const saved = await readDraft(template.slug); if (!cancelled && saved) setDraft(saved); }
      } catch (error) { if (!cancelled) { setNotice(error instanceof Error ? error.message : "Không thể đọc bản nháp."); if (id) setLoadFailed(true); } }
      finally { if (!cancelled) setReady(true); }
    };
    void load(); return () => { cancelled = true; };
  }, [template.slug]);
  const rememberServer = (card: ServerCard) => {
    setServerCard(card); setShareUrl(card.sharePath ? window.location.origin + card.sharePath : "");
    const url = new URL(window.location.href); url.searchParams.set("card", card.id); window.history.replaceState(null, "", url);
  };
  const saveServer = async (publish = false) => {
    if (!validate()) return;
    setBusy(true);
    try {
      await saveDraft(draft);
      const uploaded = await uploadDraft(draft);
      let card = await cardRequest<ServerCard>(serverCard ? `/${serverCard.id}` : "", { method: serverCard ? "PUT" : "POST", body: JSON.stringify({ draft: uploaded, revision: serverCard?.revision }) });
      rememberServer(card);
      if (publish) { card = await cardRequest<ServerCard>(`/${card.id}/publish`, { method: "POST", body: JSON.stringify({ revision: card.revision }) }); rememberServer(card); }
      setNotice(publish ? "Đã xuất bản! Ai có link bên dưới đều có thể mở thiệp, không cần đăng nhập." : "Đã lưu lên server. Bản công khai chỉ thay đổi khi bạn nhấn Xuất bản / cập nhật link.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể lưu thiệp lên server."); }
    finally { setBusy(false); }
  };
  const revoke = async () => {
    if (!serverCard) return;
    setBusy(true);
    try { rememberServer(await cardRequest<ServerCard>(`/${serverCard.id}/publication`, { method: "DELETE", body: JSON.stringify({ revision: serverCard.revision }) })); setNotice("Đã thu hồi link. Nếu xuất bản lại, bạn sẽ nhận một link mới."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Không thể thu hồi link."); }
    finally { setBusy(false); }
  };
  const setValue = (key: string, value: CardValue) => { setDraft(current => ({ ...current, values: { ...current.values, [key]: value } })); setErrors(current => { const next = { ...current }; delete next[key]; return next; }); setNotice(""); };
  const validate = () => { const found = validateDraft(template, draft); setErrors(found); if (Object.keys(found).length) { setNotice("Hãy kiểm tra các trường được đánh dấu trước khi xem thử."); return false; } return true; };
  const save = async (preview = false) => {
    if (!validate()) return;
    setBusy(true);
    try { await saveDraft(draft); setNotice("Đã lưu bản nháp trên thiết bị này."); if (preview) { setPreviewVersion(version => version + 1); setTab(3); } }
    catch { setNotice("Không thể lưu bản nháp. Hãy tải tệp thiệp để giữ nội dung của bạn."); }
    finally { setBusy(false); }
  };
  const exportDraft = () => {
    if (!validate()) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `${template.slug}.craftcard.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Đã tải tệp thiệp. Bạn có thể nhập lại tệp trên thiết bị khác.");
  };
  const loadFile = async (file?: File) => {
    if (!file) return;
    try { if (file.size > 40 * 1024 * 1024) throw new Error("Tệp tối đa 40 MB."); const imported = parseDraft(JSON.parse(await file.text())); if (imported.template !== template.slug) throw new Error("Tệp thuộc mẫu khác. Hãy mở đúng mẫu thiệp trước khi nhập."); setDraft(imported); setErrors({}); setNotice("Đã nhập nội dung. Nhấn Lưu & xem thử để áp dụng."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Không thể đọc tệp thiệp."); }
  };
  const renderField = (field: CardField) => {
    const raw = draft.values[field.key]; const value = typeof raw === "string" ? raw : "";
    const id = `field-${field.key}`;
    const common = { id, "aria-invalid": Boolean(errors[field.key]), "aria-describedby": errors[field.key] ? `${id}-error` : undefined };
    let input;
    if (field.type === "list") {
      const rows = Array.isArray(raw) ? raw.filter((row): row is Record<string, string> => typeof row === "object") : [];
      input = <div className="repeater">{rows.map((row, index) => <div key={index} className="repeat-row"><strong>Mục {index + 1}</strong>{field.columns?.map(column => <label key={column}><span>{column}</span><input aria-label={`${field.label} ${index + 1}: ${column}`} value={row[column] || ""} maxLength={500} onChange={event => setValue(field.key, rows.map((item, i) => i === index ? { ...item, [column]: event.target.value } : item))} /></label>)}<div className="row-actions"><button type="button" disabled={index === 0} onClick={() => { const next = [...rows]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setValue(field.key, next); }}>↑ Lên</button><button type="button" disabled={index === rows.length - 1} onClick={() => { const next = [...rows]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; setValue(field.key, next); }}>↓ Xuống</button><button type="button" onClick={() => setValue(field.key, rows.filter((_, i) => i !== index))}>Xóa mục {index + 1}</button></div></div>)}<button id={id} type="button" disabled={rows.length >= (field.max || 12)} onClick={() => setValue(field.key, [...rows, Object.fromEntries((field.columns || []).map(column => [column, ""]))])}>+ Thêm mục ({rows.length}/{field.max})</button></div>;
    } else if (field.type === "audio") {
      input = <><input {...common} type="file" accept="audio/mpeg,audio/wav,audio/ogg" disabled={busy} onChange={async event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; setBusy(true); try { setValue(field.key, await importAudio(file)); } catch (error) { setErrors(current => ({ ...current, [field.key]: error instanceof Error ? error.message : "Không thể đọc nhạc." })); } finally { setBusy(false); } }} /><small>MP3, WAV hoặc OGG, tối đa 8 MB. Nhạc chỉ phát khi người nhận bắt đầu tương tác.</small>{value && <><audio controls src={value} preload="metadata" /><button type="button" onClick={() => setValue(field.key, "")}>Bỏ nhạc nền</button></>}</>;
    } else if (field.type === "image" || field.type === "images") {
      const images = field.type === "image" ? value ? [value] : [] : Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];
      input = <><input {...common} type="file" accept="image/jpeg,image/png,image/webp" multiple={field.type === "images"} disabled={busy} onChange={async event => {
        const files = Array.from(event.target.files || []); event.target.value = ""; if (!files.length) return;
        if (field.type === "images" && images.length + files.length > (field.max || 12)) { setErrors(current => ({ ...current, [field.key]: `Tối đa ${field.max || 12} ảnh.` })); return; }
        setBusy(true); try { const uploaded = await Promise.all(files.map(importPhoto)); setValue(field.key, field.type === "image" ? uploaded[0] : [...images, ...uploaded]); } catch (error) { setErrors(current => ({ ...current, [field.key]: error instanceof Error ? error.message : "Không thể đọc ảnh." })); } finally { setBusy(false); }
      }} /><small>JPG, PNG, WebP · tối đa 8 MB/ảnh. Ảnh được thu nhỏ để thiệp tải nhẹ hơn.</small><div className="upload-grid">{images.map((src, index) => <div key={index}><img src={src} alt={`Ảnh đã chọn ${index + 1}`} /><div><button type="button" onClick={() => setValue(field.key, field.type === "image" ? "" : images.filter((_, i) => i !== index))}>Xóa ảnh {index + 1}</button>{field.type === "images" && index > 0 && <button type="button" onClick={() => { const next = [...images]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setValue(field.key, next); }}>↑</button>}</div></div>)}</div></>;
    } else if (field.type === "textarea") input = <textarea {...common} value={value} rows={field.key === "message" ? 7 : 3} maxLength={5000} onChange={event => setValue(field.key, event.target.value)} />;
    else if (field.type === "select") input = <select {...common} value={value || field.options?.[0]} onChange={event => setValue(field.key, event.target.value)}>{field.options?.map(option => <option key={option}>{option}</option>)}</select>;
    else input = <input {...common} type={field.type} value={value || (field.type === "color" ? template.color : "")} min={field.type === "number" ? 0 : undefined} max={field.type === "number" ? field.key === "year" ? 9999 : 150 : undefined} maxLength={500} onChange={event => setValue(field.key, event.target.value)} />;
    return <div className="editor-field" key={field.key}><label htmlFor={id}>{field.label}{field.required && <span aria-label="bắt buộc"> *</span>}</label>{input}{errors[field.key] && <p id={`${id}-error`} className="field-error">{errors[field.key]}</p>}</div>;
  };
  const designKeys = ["accent", "envelopeColor", "envelopeLabel", "seal"];
  const all = fieldsFor(template);
  const visible = tab === 0 ? commonFields.filter(field => !designKeys.includes(field.key)) : tab === 1 ? template.fields.filter(field => !commonFields.some(common => common.key === field.key)) : all.filter(field => designKeys.includes(field.key));
  return <main className="cards-workspace"><header className="cards-top"><Link href="/cards">← Bộ sưu tập 54 thiệp</Link><Link href="/cards/mine">Thiệp của tôi ☁</Link></header>
    <div className="editor-heading"><p>{template.category}</p><h1>{template.title}</h1><p>{template.action}. {template.reveal}.</p></div>
    <section className="server-card-panel" aria-label="Lưu và chia sẻ công khai"><h2>Lưu & gửi thiệp</h2><p>Lưu bản nháp riêng tư vào tài khoản. Khi xuất bản, người có link xem được lời chúc, ảnh và nhạc bạn đã chọn. Thu hồi link sẽ chặn lượt truy cập mới; nội dung người nhận đã tải không thể thu hồi.</p>
      {!signedIn ? <Link href={`/auth?redirect=${encodeURIComponent(loginPath)}`} onClick={async event => { event.preventDefault(); try { if (!loadFailed) await saveDraft(draft); window.location.assign(`/auth?redirect=${encodeURIComponent(loginPath)}`); } catch { setNotice("Không lưu được bản nháp trên thiết bị. Hãy tải tệp thiệp trước khi đăng nhập."); } }}>Đăng nhập để lưu và chia sẻ →</Link> : <div className="editor-tools"><button disabled={!ready || busy || loadFailed} onClick={() => void saveServer()}>Lưu lên server</button><button className="card-primary" disabled={!ready || busy || loadFailed} onClick={() => void saveServer(true)}>{serverCard?.sharePath ? "Cập nhật bản công khai" : "Xuất bản & tạo link"}</button>{serverCard?.sharePath && <button disabled={busy} onClick={() => void revoke()}>Thu hồi link</button>}</div>}
      {busy && <p role="status">Đang xử lý, vui lòng đợi…</p>}
      {shareUrl && <div className="share-link"><label htmlFor="public-card-link">Link chia sẻ công khai</label><input id="public-card-link" value={shareUrl} readOnly onFocus={event => event.target.select()} /><button onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setNotice("Đã sao chép link chia sẻ."); } catch { setNotice("Hãy chọn và sao chép link trong ô bên trên."); } }}>Sao chép link</button><a href={shareUrl} target="_blank" rel="noreferrer">Mở thiệp ↗</a>{shareUrl.startsWith("http://localhost") && <p>Đây là link thử trên máy của bạn. Để gửi cho người khác, hãy mở website đã deploy và xuất bản tại đó.</p>}</div>}
      {loadFailed && <p role="alert">Không tải được thiệp trên server. <Link href="/cards/mine">Quay lại Thiệp của tôi</Link> hoặc tải lại trang để thử lại.</p>}
      <p className="editor-notice" role="status">{notice}</p>
    </section>
    <div className="editor-layout"><section className="editor-panel"><fieldset disabled={busy || loadFailed} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}><nav className="editor-tabs" aria-label="Các bước cá nhân hóa">{["Lời chúc & ảnh", "Nét riêng của mẫu", "Phong thư & màu", "Xem thử"].map((label, index) => <button key={label} aria-current={tab === index ? "step" : undefined} onClick={() => index === 3 ? void save(true) : setTab(index)} disabled={!ready || busy || loadFailed}>{index + 1}. {label}</button>)}</nav>
      {!ready ? <p role="status">Đang đọc bản nháp…</p> : tab === 3 ? <div className="preview-info"><h2>Bản xem thử cá nhân hóa</h2><p>Thiệp dùng nội dung bạn vừa lưu. Bản nháp hiện chỉ lưu trên thiết bị này; đường dẫn xem bản nháp không phải link chia sẻ công khai.</p><Link className="card-primary" href={`/love-gift/${template.slug}?draft=1`} target="_blank" rel="noreferrer">Mở toàn màn hình ↗</Link><button onClick={exportDraft}>Tải tệp thiệp để lưu / chuyển thiết bị</button></div> : <form onSubmit={event => { event.preventDefault(); void save(true); }}><h2>{tab === 0 ? "Viết điều bạn muốn gửi" : tab === 1 ? "Những chi tiết chỉ thiệp này có" : "Chọn màu cho món quà"}</h2><p className="editor-help">Dấu * là thông tin cần xác nhận. Bạn có thể sửa nội dung mẫu hoặc để trống các mục không cần dùng.</p>{visible.map(renderField)}<button className="card-primary" disabled={busy} type="submit">Lưu & xem thử</button></form>}
      {Object.keys(errors).length > 0 && <div role="alert" className="field-error">{Object.entries(errors).map(([key, error]) => <p key={key}>{all.find(field => field.key === key)?.label}: {error}</p>)}</div>}
      <div className="editor-tools"><button disabled={!ready || busy || loadFailed} onClick={() => void save()}>Lưu bản nháp</button><button disabled={!ready || busy || loadFailed} onClick={exportDraft}>Tải tệp thiệp</button><button disabled={!ready || busy || loadFailed} onClick={() => fileInput.current?.click()}>Nhập tệp thiệp</button><input ref={fileInput} type="file" accept=".json,.craftcard" hidden onChange={event => { void loadFile(event.target.files?.[0]); event.target.value = ""; }} /></div>
    </fieldset></section><aside className="editor-preview"><p>{previewVersion ? "NỘI DUNG ĐÃ LƯU" : "BẢN MẪU · LƯU ĐỂ XEM NỘI DUNG CỦA BẠN"}</p><div className="phone-preview"><iframe key={previewVersion} title="Xem trước thiệp trên điện thoại" src={`/love-gift/${template.slug}?preview=1${previewVersion ? "&draft=1" : ""}`} /></div><p>Có thể chạm, xoay mô hình và mở thư ngay trong màn hình này.</p></aside></div>
  </main>;
}
