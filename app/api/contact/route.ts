import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
const schema=z.object({name:z.string().trim().min(2),email:z.string().email(),phone:z.string().trim().max(30).optional(),subject:z.string().trim().min(2),message:z.string().trim().min(10).max(3000)});
export async function POST(req:Request){const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Please check the form."},{status:400});await db.contact.create({data:parsed.data});return NextResponse.json({ok:true});}
