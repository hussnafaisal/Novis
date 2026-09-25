"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  useEffect(() => { fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => { if (!d?.user) router.replace("/auth/sign-in"); else setUser(d.user); }).catch(() => router.replace("/auth/sign-in")); }, [router]);
  async function logout() { await fetch("/api/auth/sign-out", { method: "POST" }); router.replace("/"); router.refresh(); }
  if (!user) return <main className="page-shell"><div className="loading-card">Loading account...</div></main>;
  return <main className="page-shell"><div className="account-card"><p className="eyebrow">Customer account</p><h1>Welcome, {user.name}</h1><p>{user.email}</p><div className="account-actions"><Link href="/cart" className="gold-button">View Cart</Link><Link href="/#collections" className="dark-button">Continue Shopping</Link><button onClick={logout} className="dark-button">Sign Out</button></div></div></main>;
}
