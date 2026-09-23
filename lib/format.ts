export const money=(n:number)=>`Rs. ${n.toLocaleString("en-PK")}`;
export const parseProduct=(p:any)=>({ ...p, images:Array.isArray(p.images)?p.images:JSON.parse(p.images||"[]"), features:Array.isArray(p.features)?p.features:JSON.parse(p.features||"[]") });
