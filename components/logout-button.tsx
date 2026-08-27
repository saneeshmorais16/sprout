"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
export function LogoutButton() { const router = useRouter(); return <button className="icon-button" aria-label="Sign out" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}><LogOut/></button>; }
