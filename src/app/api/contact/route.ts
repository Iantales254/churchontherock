import { NextResponse } from "next/server";
import { readContactPayload } from "@/lib/validation";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const payload = readContactPayload(await request.json());
    const client = getSupabaseAdmin();
    if (client) {
      const { error } = await client.from("contact_messages").insert(payload);
      if (error) return NextResponse.json({ error: "Unable to save message" }, { status: 502 });
      return NextResponse.json({ message: "Message sent" });
    }
    const webhook = process.env.CONTACT_WEBHOOK_URL;

    if (!webhook) {
      return NextResponse.json({ error: "Contact service is not configured" }, { status: 503 });
    }

    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source: "church-on-the-rock-website" }),
    });

    if (!response.ok) return NextResponse.json({ error: "Unable to send message" }, { status: 502 });
    return NextResponse.json({ message: "Message sent" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
