import { db } from "@/lib/db";
export const runtime="nodejs";
const enc=new TextEncoder();
function streamText(text:string){return new ReadableStream({async start(c){for(const word of text.split(" ")){c.enqueue(enc.encode(word+" "));await new Promise(r=>setTimeout(r,16))}c.close()}})}
export async function POST(req:Request){
  try{
    const b=await req.json(); const message=typeof b.message==="string"?b.message.trim():"";
    if(!message)return new Response("Invalid message",{status:400});
    const url=process.env.AI_API_URL,key=process.env.AI_API_KEY,model=process.env.AI_MODEL;
    if(!url||!key||!model){const text=`Novis Concierge: I can help with style, movement, water resistance, warranty, gifting and budget. For a precise recommendation, tell me your preferred style and budget.`; await db.recordChat(Math.ceil(text.length/4)); return new Response(streamText(text),{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-cache"}})}
    const upstream=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:"system",content:"You are the Novis luxury watch concierge. Be concise, factual and helpful. Never invent product specifications. If product-specific information is unavailable, say so."},{role:"user",content:message}],stream:true})});
    if(!upstream.ok||!upstream.body)return new Response("AI provider unavailable",{status:502});
    await db.recordChat(Math.ceil(message.length/4));
    return new Response(upstream.body,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-cache"}});
  }catch{return new Response("AI request failed",{status:500})}
}
