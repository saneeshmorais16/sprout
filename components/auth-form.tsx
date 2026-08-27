"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json(); setLoading(false); if (!response.ok) { setError(result.error || "Something went wrong."); return; } router.push(result.next); router.refresh();
  }
  return <form className="form-stack" onSubmit={submit}>
    {mode === "register" && <label htmlFor="firstName">First name<Input id="firstName" name="firstName" autoComplete="given-name" required placeholder="Maya"/></label>}
    <label htmlFor="email">Email<Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required placeholder="you@example.com"/></label>
    <label htmlFor="password">Password<Input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required placeholder="At least 10 characters"/></label>
    {mode === "register" && <label htmlFor="confirmPassword">Confirm password<Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Repeat your password"/></label>}
    {mode === "login" && <Link className="form-link" href="/forgot-password">Forgot password?</Link>}
    <p className="form-error" role="alert">{error}</p>
    <Button disabled={loading}>{loading ? <><LoaderCircle className="spin"/> Please wait…</> : <>{mode === "login" ? "Sign in" : "Create account"}<ArrowRight/></>}</Button>
  </form>;
}
