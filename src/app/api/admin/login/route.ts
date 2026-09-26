import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json() as { email?: string; password?: string };
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
  }
  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Signed in" });
  response.cookies.set("church_admin", process.env.ADMIN_SESSION_SECRET || expectedPassword, {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Signed out" });
  response.cookies.delete("church_admin");
  return response;
}
