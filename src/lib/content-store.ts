import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase";

export type ContentType = "events" | "branches" | "sermons" | "gallery" | "people" | "fellowships" | "articles";
export type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  date: string;
  location: string;
  url: string;
  createdAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "content.json");
const tables: ContentType[] = ["events", "branches", "sermons", "gallery", "people", "fellowships", "articles"];

function supabase() {
  return getSupabaseAdmin();
}

function publicSupabase() {
  return getSupabasePublic();
}

async function readItems(): Promise<ContentItem[]> {
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as ContentItem[];
  } catch {
    return [];
  }
}

export async function listContent(type?: ContentType) {
  const client = publicSupabase() || supabase();
  if (client) {
    const types = type ? [type] : tables;
    const rows = (await Promise.all(types.map(async (table) => {
      const result = await client.from(table).select("*").order("created_at", { ascending: false });
      if (result.error) throw new Error(`Unable to read ${table}: ${result.error.message}`);
      return result.data.map((row) => normalizeRow(table, row));
    }))).flat();
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const items = await readItems();
  return type ? items.filter((item) => item.type === type) : items;
}

export async function addContent(input: Omit<ContentItem, "id" | "createdAt">) {
  const client = supabase();
  if (!client && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin content changes");
  }
  if (client) {
    const table = input.type;
    const result = await client.from(table).insert(toRowForTable(table, input)).select("*").single();
    if (result.error) throw new Error(`Unable to create ${table}: ${result.error.message}`);
    return normalizeRow(table, result.data);
  }
  const items = await readItems();
  const item = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify([item, ...items], null, 2));
  return item;
}

export async function removeContent(id: string) {
  const client = supabase();
  if (!client && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin content changes");
  }
  if (client) {
    for (const table of tables) {
      const result = await client.from(table).delete().eq("id", id).select("id");
      if (result.error) throw new Error(`Unable to delete ${table}: ${result.error.message}`);
      if (result.data.length) return true;
    }
    return false;
  }
  const items = await readItems();
  const nextItems = items.filter((item) => item.id !== id);
  if (nextItems.length === items.length) return false;
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(nextItems, null, 2));
  return true;
}

export async function updateContent(id: string, input: Partial<Omit<ContentItem, "id" | "createdAt" | "type">>) {
  const client = supabase();
  if (!client && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin content changes");
  }
  if (client) {
    for (const table of tables) {
      const result = await client.from(table).update(toRowForTable(table, input)).eq("id", id).select("*").maybeSingle();
      if (result.error) throw new Error(`Unable to update ${table}: ${result.error.message}`);
      if (result.data) return normalizeRow(table, result.data);
    }
    return null;
  }
  const items = await readItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const item = { ...items[index], ...input };
  items[index] = item;
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(items, null, 2));
  return item;
}

function normalizeRow(type: ContentType, row: Record<string, string | null>): ContentItem {
  const common = {
    id: row.id || "",
    type,
    description: row.description || "",
    date: row.date || "",
    location: row.location || "",
    url: row.url || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
  if (type === "branches") return { ...common, title: row.name || "", description: row.contact_info || "", date: row.service_times || "", location: row.location || "" };
  if (type === "sermons") return { ...common, title: row.title || "", description: row["God loves us with no conditions"] || "", location: row.preacher || "", url: row.youtube_url || "" };
  if (type === "people") return { ...common, title: row.name || "", description: row.bio || "", location: row.role || "", url: row.photo_url || "" };
  if (type === "fellowships") return { ...common, title: row.name || "", date: [row.day, row.time].filter(Boolean).join(" · "), location: row.location || "" };
  return { ...common, title: row.title || "" };
}

function toRowForTable(table: ContentType, input: Partial<Omit<ContentItem, "id" | "createdAt">>): Record<string, string | undefined> {
  if (table === "branches") return { name: input.title, contact_info: input.description, service_times: input.date, location: input.location };
  if (table === "sermons") return { title: input.title, "God loves us with no conditions": input.description, date: input.date, preacher: input.location, youtube_url: input.url };
  if (table === "gallery") return { title: input.title, description: input.description, url: input.url };
  if (table === "people") return { name: input.title, bio: input.description, role: input.location, photo_url: input.url };
  if (table === "fellowships") {
    const [day, time] = (input.date || "").split(" · ");
    return { name: input.title, description: input.description, day: day || "", time: time || "", location: input.location };
  }
  return { title: input.title, description: input.description, date: input.date, location: input.location, url: input.url };
}
