import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret=new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-secret-change-me");
export async function middleware(req:NextRequest){
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (!req.nextUrl.pathname.startsWith("/admin") && !req.nextUrl.pathname.startsWith("/checkout")) return NextResponse.next();
  const token=req.cookies.get("sveston_session")?.value;
  if (!token) return NextResponse.redirect(new URL(req.nextUrl.pathname.startsWith("/admin")?"/admin/login":"/auth/sign-in",req.url));
  try {
    const {payload}=await jwtVerify(token,secret);
    if(req.nextUrl.pathname.startsWith("/admin") && payload.role!=="ADMIN") return NextResponse.redirect(new URL("/admin/login",req.url));
    if(req.nextUrl.pathname.startsWith("/checkout") && payload.role!=="CUSTOMER") return NextResponse.redirect(new URL("/auth/sign-in?next=/checkout",req.url));
    return NextResponse.next();
  } catch { return NextResponse.redirect(new URL(req.nextUrl.pathname.startsWith("/admin")?"/admin/login":"/auth/sign-in",req.url)); }
}
export const config={matcher:["/admin/:path*","/checkout/:path*"]};
