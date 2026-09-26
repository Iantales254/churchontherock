"use client";

import { FormEvent, startTransition, useEffect, useState } from "react";

type ContentType = "events" | "branches" | "sermons" | "gallery" | "people" | "fellowships" | "articles";
type Item = { id: string; type: ContentType; title: string; description: string; date: string; location: string; url: string };

const labels: Record<ContentType, string> = { events: "Events", branches: "Branches", sermons: "Sermons", gallery: "Gallery", people: "People", fellowships: "Fellowships", articles: "News & Teachings" };
const fieldLabels: Record<ContentType, { title: string; date?: string; location?: string; description: string; url?: string }> = {
  events: { title: "Event title", date: "Date", location: "Location", description: "Description", url: "Event URL" },
  branches: { title: "Branch name", date: "Service times", location: "Location", description: "Contact information" },
  sermons: { title: "Sermon title", date: "Date", location: "Preacher", description: "Description", url: "YouTube URL" },
  gallery: { title: "Image title", description: "Description", url: "Image URL" },
  people: { title: "Name", location: "Role", description: "Bio", url: "Photo URL" },
  fellowships: { title: "Fellowship name", date: "Day and time", location: "Location", description: "Description" },
  articles: { title: "Article title", date: "Publication date", location: "Category or author", description: "Teaching or news content", url: "Optional reference URL" },
};

async function readResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) as { items?: Item[]; url?: string; error?: string } : {};
  } catch {
    return { error: `Server returned ${response.status} without a JSON response` };
  }
}

export default function ContentManager({ type }: { type: ContentType }) {
  const fields = fieldLabels[type];
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", url: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/content?type=${type}`, { cache: "no-store" })
      .then(readResponse)
      .then((result) => {
        if (!cancelled) startTransition(() => {
          setItems(result.items || []);
          if (result.error) setStatus(result.error);
        });
      });
    return () => { cancelled = true; };
  }, [type]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving...");
    const response = await fetch("/api/content", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, type, ...(editingId ? { id: editingId } : {}) }) });
    const result = await readResponse(response);
    if (!response.ok) return setStatus(result.error || "Unable to save");
    setForm({ title: "", description: "", date: "", location: "", url: "" });
    setEditingId(null);
    setStatus("Saved");
    const refreshed = await fetch(`/api/content?type=${type}`, { cache: "no-store" });
    const refreshedResult = await readResponse(refreshed);
    setItems(refreshedResult.items || []);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setStatus("Uploading image...");
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await readResponse(response);
    setUploading(false);
    if (!response.ok || !result.url) return setStatus(result.error || "Unable to upload image");
    setForm((current) => ({ ...current, url: result.url as string }));
    setStatus("Image uploaded");
  }

  async function remove(id: string) {
    const response = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
    if (response.ok) {
      const refreshed = await fetch(`/api/content?type=${type}`, { cache: "no-store" });
      const refreshedResult = await readResponse(refreshed);
      setItems(refreshedResult.items || []);
    }
  }

  function edit(item: Item) {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description, date: item.date, location: item.location, url: item.url });
    setStatus("Editing existing entry");
  }

  const showUpload = type === "gallery" || type === "people";
  const showUrl = Boolean(fields.url);

  return <div className="grid gap-6 xl:grid-cols-[minmax(280px,380px)_1fr]"><form onSubmit={submit} className="bg-white p-6 md:p-8"><p className="sans text-[10px] font-bold uppercase tracking-widest text-[#a44d32]">{editingId ? "Edit" : "Add"} {labels[type].slice(0, -1)}</p><h2 className="mt-3 text-3xl">{editingId ? "Update this entry." : "Create an entry."}</h2><div className="mt-7 flex flex-col gap-3"><input name="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={fields.title} className="border border-[#202421]/20 bg-[#f8f7f2] px-4 py-3 outline-none focus:border-[#a44d32]" />{fields.date && <input name="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} placeholder={fields.date} className="border border-[#202421]/20 bg-[#f8f7f2] px-4 py-3 outline-none focus:border-[#a44d32]" />}{fields.location && <input name="location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder={fields.location} className="border border-[#202421]/20 bg-[#f8f7f2] px-4 py-3 outline-none focus:border-[#a44d32]" />}{showUpload && <label className="border border-dashed border-[#202421]/30 bg-[#f8f7f2] px-4 py-4 sans text-xs text-[#77756e]">Upload image<input type="file" accept="image/*" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} className="mt-2 block w-full text-xs" /></label>}{showUrl && <input name="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder={showUpload ? `Or paste ${fields.url?.toLowerCase()}` : fields.url} className="border border-[#202421]/20 bg-[#f8f7f2] px-4 py-3 outline-none focus:border-[#a44d32]" />}<textarea name="description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder={fields.description} rows={5} className="border border-[#202421]/20 bg-[#f8f7f2] px-4 py-3 outline-none focus:border-[#a44d32]" /><button disabled={uploading} className="bg-[#202421] px-5 py-3 sans text-xs font-bold uppercase tracking-widest text-white">{editingId ? "Update" : "Save"}</button>{status && <p className="sans text-xs text-[#77756e]">{status}</p>}</div></form><div className="grid gap-3">{items.map((item) => <article key={item.id} className="bg-white p-6 md:p-7"><div className="flex items-start justify-between gap-5"><div><p className="sans text-[10px] font-bold uppercase tracking-widest text-[#a44d32]">{item.date || "Entry"}</p><h3 className="mt-2 text-2xl">{item.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#77756e]">{item.description}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => edit(item)} className="border border-[#202421]/20 px-3 py-2 sans text-xs">Edit</button><button onClick={() => void remove(item.id)} className="border border-[#a44d32]/40 px-3 py-2 sans text-xs text-[#a44d32]">Delete</button></div></div><p className="mt-5 sans text-xs text-[#77756e]">{item.location}{item.url ? ` · ${item.url}` : ""}</p></article>)}</div></div>;
}