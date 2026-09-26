import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const payload = await request.json() as {
    Body?: {
      stkCallback?: {
        ResultCode?: number;
        CallbackMetadata?: { Item?: { Name?: string; Value?: string | number }[] };
      };
    };
  };
  const callback = payload.Body?.stkCallback;
  console.info("M-Pesa callback received", JSON.stringify(payload));

  if (callback?.ResultCode === 0) {
    const metadata = Object.fromEntries((callback.CallbackMetadata?.Item || [])
      .filter((item) => item.Name)
      .map((item) => [item.Name, item.Value]));
    const client = getSupabaseAdmin();
    if (client && typeof metadata.Amount === "number") {
      const { error } = await client.from("donations").insert({
        donor_name: "M-Pesa supporter",
        amount: metadata.Amount,
        method: "M-Pesa",
      });
      if (error) console.error("Unable to save M-Pesa donation", error.message);
    }
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
