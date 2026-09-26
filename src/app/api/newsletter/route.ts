import { NextResponse } from "next/server";
import { readEmail } from "@/lib/validation";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const email = readEmail(await request.json());
    const client = getSupabaseAdmin();
    if (client) {
      const { error } = await client.from("newsletter_subscribers").upsert({ email }, { onConflict: "email" });
      if (error) return NextResponse.json({ error: "Unable to subscribe" }, { status: 502 });
      return NextResponse.json({ message: "You are subscribed" });
    }
    const webhook = process.env.NEWSLETTER_WEBHOOK_URL;

    if (!webhook) {
      return NextResponse.json({ error: "Newsletter service is not configured" }, { status: 503 });
    }

    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "church-on-the-rock-website" }),
    });

    if (!response.ok) return NextResponse.json({ error: "Unable to subscribe" }, { status: 502 });
    return NextResponse.json({ message: "You are subscribed" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
