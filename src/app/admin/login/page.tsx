"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) return setError(result.error || "Unable to sign in");
    router.push("/admin");
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#202421] px-5 text-[#202421]"><form onSubmit={submit} className="w-full max-w-md bg-[#f6f4ee] p-8 md:p-12"><Link href="/" className="sans text-xs font-bold uppercase tracking-widest text-[#a44d32]">Church on the Rock</Link><h1 className="mt-8 text-4xl">Content studio</h1><p className="mt-3 text-[#77756e]">Sign in to manage content.</p><label className="mt-8 block sans text-xs font-bold uppercase tracking-widest">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 w-full border border-[#202421]/20 bg-white px-4 py-3 outline-none focus:border-[#a44d32]" /></label><label className="mt-5 block sans text-xs font-bold uppercase tracking-widest">Password<div className="relative mt-2"><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} required className="w-full border border-[#202421]/20 bg-white px-4 py-3 pr-20 outline-none focus:border-[#a44d32]" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 sans text-xs font-bold uppercase tracking-wider text-[#a44d32]">{showPassword ? "Hide" : "Show"}</button></div></label>{error && <p className="mt-5 border-l-4 border-[#a44d32] bg-white p-3 sans text-sm">{error}</p>}<button disabled={loading} className="mt-7 w-full bg-[#a44d32] px-5 py-4 sans text-sm font-bold text-white disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button></form></main>;
}
