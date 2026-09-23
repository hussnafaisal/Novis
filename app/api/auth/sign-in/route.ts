import{NextResponse}from"next/server";import{loginCustomer}from"@/lib/auth";import{z}from"zod";
const schema=z.object({email:z.string().email(),password:z.string().min(8)});
export async function POST(req:Request){const b=await req.json();const v=schema.safeParse(b);if(!v.success)return NextResponse.json({error:"Invalid email or password."},{status:400});const u=await loginCustomer(v.data.email,v.data.password);if(!u)return NextResponse.json({error:"Invalid email or password."},{status:401});return NextResponse.json({ok:true,user:{id:u.id,name:u.name,email:u.email}})}
