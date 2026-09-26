import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const tables = new Set(["newsletter_subscribers", "contact_messages", "donations"]);

function authorized(request: Request) {
  const session = request.headers.get("cookie")?.match(/(?:^|;\s*)church_admin=([^;]+)/)?.[1];
  const expected = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return Boolean(expected && session === expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const table = new URL(request.url).searchParams.get("table") || "";
  if (!tables.has(table)) return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  const client = getSupabaseAdmin();
  if (!client) return NextResponse.json({ error: "Supabase service key is not configured" }, { status: 503 });
  const result = await client.from(table).select("*").order(table === "newsletter_subscribers" ? "subscribed_at" : "created_at", { ascending: false });
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 502 });
  return NextResponse.json({ rows: result.data });
}
