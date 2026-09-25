"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";
import { useStore } from "./StoreProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<{name:string}|null>(null);
  const { cart } = useStore();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => setCustomer(d?.user || null)).catch(() => {});
  }, []);

  const nav = [
    ["Home", "/"], ["Collections", "/collections"], ["New Arrivals", "/#latest"], ["About", "/about"], ["Contact", "/contact"],
  ];

  return <>
    <div className="topbar"><div>FREE SHIPPING ON ORDERS OVER RS. 10,000</div><div className="hidden sm:block">1-YEAR INTERNATIONAL WARRANTY</div><div className="hidden md:block">30-DAY EASY RETURNS</div></div>
    <header className="site-header">
      <div className="header-inner">
        <button className="mobile-menu md:hidden" onClick={() => setOpen(v => !v)} aria-label="Open menu">{open ? <X size={20}/> : <Menu size={20}/>}</button>
        <Link href="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">N</span><span><strong>NOVIS</strong><small>TIMEPIECES</small></span></Link>
        <nav className="desktop-nav">{nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
        <div className="header-actions">
          <button className="icon-btn hidden sm:inline-flex" aria-label="Search"><Search size={18}/></button><ThemeToggle />
          <Link href={customer ? "/account" : "/auth/sign-in"} className="icon-btn" aria-label="Account"><UserRound size={18}/></Link>
          <Link href="/cart" className="icon-btn cart-icon" aria-label="Shopping bag"><ShoppingBag size={18}/>{count > 0 && <span>{count}</span>}</Link>
        </div>
      </div>
      {open && <nav className="mobile-nav md:hidden">{nav.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<Link href={customer ? "/account" : "/auth/sign-in"} onClick={() => setOpen(false)}>{customer ? customer.name : "Account"}</Link></nav>}
    </header>
  </>;
}
