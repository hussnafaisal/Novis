import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-secret-change-me");
export async function createSession(userId:string, role:"CUSTOMER"|"ADMIN") { const token=await new SignJWT({sub:userId,role}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(secret); cookies().set("sveston_session",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800}); }
export async function getSession(){const token=cookies().get("sveston_session")?.value;if(!token)return null;try{return(await jwtVerify(token,secret)).payload as {sub:string;role:"CUSTOMER"|"ADMIN"}}catch{return null}}
export function clearSession(){cookies().set("sveston_session","",{httpOnly:true,expires:new Date(0),path:"/"})}
export async function loginCustomer(email:string,password:string){const user=await db.user.findUnique({where:{email}});if(!user||!(await bcrypt.compare(password,user.passwordHash)))return null;await createSession(user.id,"CUSTOMER");return user}
export async function registerCustomer(name:string,email:string,password:string){const hash=await bcrypt.hash(password,12);const user=await db.user.create({data:{name,email,passwordHash:hash}});await createSession(user.id,"CUSTOMER");return user}
export async function requireRole(role:"CUSTOMER"|"ADMIN"){const session=await getSession();if(!session||session.role!==role)return null;return session}
