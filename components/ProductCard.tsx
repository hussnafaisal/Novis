"use client";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "./StoreProvider";
import { money } from "@/lib/format";

export default function ProductCard({ p }: { p: any }) {
  const { openProduct, add } = useStore();
  return <article className="product-card">
    <div className="product-media"><img src={p.images[0]} alt={p.name}/><span className="sale-badge">-{p.discount}%</span><button className="wishlist" aria-label={`Save ${p.name}`}><Heart size={16}/></button><div className="product-actions"><button onClick={() => openProduct(p)}><Eye size={15}/> Quick View</button><button disabled={!p.stock} onClick={() => add(p.id)} aria-label="Add to cart"><ShoppingBag size={16}/></button></div></div>
    <div className="product-info"><p>{p.type}</p><h3>{p.name}</h3><div className="price-row"><strong>{money(p.salePrice)}</strong>{p.regularPrice > p.salePrice && <del>{money(p.regularPrice)}</del>}</div><div className="rating"><span>★★★★★</span><small>{p.unitsSold + 18} reviews</small></div></div>
  </article>;
}
