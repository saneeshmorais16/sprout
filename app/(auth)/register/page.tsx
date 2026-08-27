import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export default function RegisterPage() { return <section className="auth-content"><span className="step-kicker">Create your account</span><h1>Start growing today</h1><p>One secure account for your personalised learning journey.</p><AuthForm mode="register"/><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p></section>; }
