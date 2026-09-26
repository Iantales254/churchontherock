export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export function readContactPayload(input: unknown): ContactPayload {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid request body");
  }

  const payload = input as Record<string, unknown>;
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (name.length < 2 || name.length > 100) throw new Error("Enter your name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email");
  if (message.length < 10 || message.length > 3000) throw new Error("Message must be 10 to 3,000 characters");

  return { name, email, message };
}

export function readEmail(input: unknown): string {
  const email = input && typeof input === "object" && typeof (input as Record<string, unknown>).email === "string"
    ? ((input as Record<string, string>).email || "").trim().toLowerCase()
    : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email");
  return email;
}
