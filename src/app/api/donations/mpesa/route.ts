import { NextResponse } from "next/server";

function getMpesaBaseUrl() {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function normalizePhone(value: unknown) {
  const digits = typeof value === "string" ? value.replace(/\D/g, "") : "";
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("254") && digits.length === 12) return digits;
  throw new Error("Enter a valid Kenyan mobile number");
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as { phone?: string; amount?: number; name?: string };
    const phone = normalizePhone(input.phone);
    const amount = Math.round(Number(input.amount));
    if (!Number.isFinite(amount) || amount < 10 || amount > 150000) throw new Error("Amount must be between KES 10 and KES 150,000");

    const consumerKey = required("MPESA_CONSUMER_KEY");
    const consumerSecret = required("MPESA_CONSUMER_SECRET");
    const shortcode = required("MPESA_SHORTCODE");
    const passkey = required("MPESA_PASSKEY");
    const callbackUrl = required("MPESA_CALLBACK_URL");
    const baseUrl = getMpesaBaseUrl();

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    if (!tokenResponse.ok) throw new Error("Unable to authenticate with M-Pesa");
    const { access_token: accessToken } = await tokenResponse.json() as { access_token?: string };
    if (!accessToken) throw new Error("M-Pesa did not return an access token");

    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
    const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: "Church on the Rock",
        TransactionDesc: `Donation from ${input.name?.trim() || "supporter"}`,
      }),
    });
    const result = await stkResponse.json() as { ResponseCode?: string; CustomerMessage?: string; CheckoutRequestID?: string };
    if (!stkResponse.ok || result.ResponseCode !== "0") return NextResponse.json({ error: result.CustomerMessage || "M-Pesa request failed" }, { status: 502 });
    return NextResponse.json({ message: result.CustomerMessage || "Check your phone to complete the donation", checkoutRequestId: result.CheckoutRequestID });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Donation request failed" }, { status: 400 });
  }
}
