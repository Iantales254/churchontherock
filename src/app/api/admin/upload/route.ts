import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function authorized(request: Request) {
  const session = request.headers.get("cookie")?.match(/(?:^|;\s*)church_admin=([^;]+)/)?.[1];
  const expected = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return Boolean(expected && session === expected);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const client = getSupabaseAdmin();
  if (!client) return NextResponse.json({ error: "Supabase service key is not configured" }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Images must be 5 MB or smaller" }, { status: 400 });

  const bucket = "church-media";
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `uploads/${crypto.randomUUID()}.${extension}`;
  const upload = await client.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ error: `Upload failed: ${upload.error.message}. Create a public '${bucket}' bucket in Supabase Storage.` }, { status: 502 });
  const url = client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ url }, { status: 201 });
}
