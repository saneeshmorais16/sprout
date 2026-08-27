import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export default function LoginPage() { return <section className="auth-content"><span className="step-kicker">Welcome back</span><h1>Keep growing</h1><p>Sign in to continue your personalised money journey.</p><AuthForm mode="login"/><p className="auth-switch">New to GROW? <Link href="/register">Create an account</Link></p></section>; }
