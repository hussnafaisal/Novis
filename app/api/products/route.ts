import {NextResponse} from "next/server";import{db}from"@/lib/db";import{parseProduct}from"@/lib/format";
export async function GET(){const p=await db.product.findMany({where:{active:true},orderBy:{name:"asc"}});return NextResponse.json(p.map(parseProduct))}
