import { NextResponse } from "next/server";
import { addContent, listContent, removeContent, updateContent, type ContentType } from "@/lib/content-store";

const types = new Set(["events", "branches", "sermons", "gallery", "people", "fellowships", "articles"]);

function authorized(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const session = cookie.match(/(?:^|;\s*)church_admin=([^;]+)/)?.[1];
  const expected = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return Boolean(expected && session === expected);
}

export async function GET(request: Request) {
  try {
    const type = new URL(request.url).searchParams.get("type") || undefined;
    if (type && !types.has(type)) return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    return NextResponse.json({ items: await listContent(type as ContentType | undefined) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load content" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json() as Partial<{ type: string; title: string; description: string; date: string; location: string; url: string }>;
    if (!body.type || !types.has(body.type) || !body.title?.trim()) return NextResponse.json({ error: "Type and title are required" }, { status: 400 });
    const item = await addContent({ type: body.type as ContentType, title: body.title.trim(), description: body.description?.trim() || "", date: body.date?.trim() || "", location: body.location?.trim() || "", url: body.url?.trim() || "" });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save content" }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !(await removeContent(id))) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete content" }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json() as Partial<{ id: string; title: string; description: string; date: string; location: string; url: string }>;
    if (!body.id || !body.title?.trim()) return NextResponse.json({ error: "Id and title are required" }, { status: 400 });
    const item = await updateContent(body.id, { title: body.title.trim(), description: body.description?.trim() || "", date: body.date?.trim() || "", location: body.location?.trim() || "", url: body.url?.trim() || "" });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update content" }, { status: 502 });
  }
}
