"use client";

import { Check, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store-context";

export default function QuickViewModal() {
  const { selectedWatch: watch, setSelectedWatch, addToCart } = useStore();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  if (!watch) return null;

  const close = () => { setSelectedWatch(null); setQty(1); setActive(0); };
  const add = () => { if (addToCart(watch.id, qty)) close(); };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-3 backdrop-blur-sm" onMouseDown={close}>
      <div onMouseDown={e => e.stopPropagation()} className="max-h-[94vh] w-full max-w-5xl overflow-auto rounded-3xl border border-amber-500/20 bg-[#0d0d0d] shadow-2xl">
        <div className="flex justify-end p-3"><button onClick={close} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-amber-400"><X/></button></div>
        <div className="grid gap-7 px-5 pb-7 md:grid-cols-2 md:px-8">
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-900"><img src={watch.images[active]} alt={watch.name} className="h-full w-full object-cover"/></div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {watch.images.map((src, i) => <button key={src} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} className={`aspect-square overflow-hidden rounded-xl border ${active === i ? "border-amber-500" : "border-white/10"}`}><img src={src} alt="" className="h-full w-full object-cover"/></button>)}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[.2em] text-amber-500">{watch.type}</p>
            <h2 className="luxury-title mt-2 text-4xl text-white">{watch.name}</h2>
            <div className="mt-4 flex items-center gap-3"><span className="finance text-2xl font-bold text-amber-400">Rs. {watch.salePrice.toLocaleString()}</span><span className="text-sm text-zinc-500 line-through">Rs. {watch.regularPrice.toLocaleString()}</span></div>
            <p className="mt-5 text-sm leading-7 text-zinc-400">{watch.longDescription}</p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-300">{watch.features.map(f => <li key={f} className="flex gap-2"><Check size={17} className="mt-0.5 text-amber-500"/>{f}</li>)}</ul>
            <div className="mt-6 rounded-2xl border border-amber-500/10 bg-black/50 p-4">
              <h3 className="luxury-title text-lg text-amber-400">Technical Specifications</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-zinc-400">
                <div>Movement <b className="ml-1 text-zinc-200">{watch.movement}</b></div>
                <div>Strap <b className="ml-1 text-zinc-200">{watch.strap}</b></div>
                <div>Water Resistance <b className="ml-1 text-zinc-200">{watch.waterResistance}</b></div>
                <div>Stock <b className="ml-1 text-zinc-200">{watch.stock}</b></div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-amber-500/20">
                <button disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))} className="p-3 disabled:opacity-30"><Minus size={15}/></button>
                <span className="w-8 text-center finance">{qty}</span>
                <button disabled={qty >= watch.stock} onClick={() => setQty(q => Math.min(watch.stock, q + 1))} className="p-3 disabled:opacity-30"><Plus size={15}/></button>
              </div>
              <button disabled={!watch.stock} onClick={add} className="flex-1 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40">{watch.stock ? "Add to Cart" : "Sold Out"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
