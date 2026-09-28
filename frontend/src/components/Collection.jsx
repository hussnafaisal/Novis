import { useMemo, useState } from 'react';
import { ArrowRight, Eye, ShoppingBag, X, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_META = {
  all: { title: 'TIMEPIECES WITH PRESENCE', eyebrow: 'THE NOVIS COLLECTION', description: 'Explore every NOVIS timepiece, shaped around clean proportions, refined materials and precise movement.' },
  men: { title: "MEN'S WATCHES", eyebrow: 'COLLECTION · MEN', description: 'Balanced cases, disciplined dials and everyday mechanical character.' },
  women: { title: "WOMEN'S WATCHES", eyebrow: 'COLLECTION · WOMEN', description: 'Elegant proportions and refined details designed for a modern wrist.' },
  couple: { title: 'COUPLE WATCHES', eyebrow: 'COLLECTION · COUPLE', description: 'Paired timepieces designed to share the same sense of occasion.' },
  limited: { title: 'LIMITED EDITION', eyebrow: 'COLLECTION · LIMITED', description: 'Distinctive NOVIS pieces produced for a more considered collection.' },
  rolex: { title: 'ROLEX', eyebrow: 'BRAND COLLECTION', description: 'Explore timepieces currently available under this brand.' },
  omega: { title: 'OMEGA', eyebrow: 'BRAND COLLECTION', description: 'Explore timepieces currently available under this brand.' },
  tissot: { title: 'TISSOT', eyebrow: 'BRAND COLLECTION', description: 'Explore timepieces currently available under this brand.' },
  citizen: { title: 'CITIZEN', eyebrow: 'BRAND COLLECTION', description: 'Explore timepieces currently available under this brand.' },
};

export default function Collection({ products = [], onOpen, onAdd, initialCategory = 'all' }) {
  const [tab, setTab] = useState(initialCategory === 'all' ? 'all' : initialCategory);
  const [quick, setQuick] = useState(null);
  const isDedicatedPage = initialCategory !== 'all';
  const active = isDedicatedPage ? initialCategory : tab;
  const meta = CATEGORY_META[active] || { title: active.toUpperCase(), eyebrow: 'NOVIS COLLECTION', description: 'Explore the available NOVIS timepieces.' };

  const filtered = useMemo(() => {
    if (active === 'all') return products;
    const key = active.toLowerCase();
    return products.filter((p) => String(p.category || '').toLowerCase() === key || String(p.brand || '').toLowerCase() === key);
  }, [active, products]);

  return (
    <section className={`section collection ${isDedicatedPage ? 'collection-page' : 'collection-home'}`}>
      <div className="collection-hero-head">
        <div>
          <span className="eyebrow">{meta.eyebrow}</span>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
        <Link className="collection-back" to="/">NOVIS HOME <ArrowRight size={14} /></Link>
      </div>

      {!isDedicatedPage && (
        <div className="tabs" role="tablist" aria-label="Collection categories">
          {Object.entries({ all: 'ALL', men: 'MEN', women: 'WOMEN', couple: 'COUPLE', limited: 'LIMITED' }).map(([value, label]) => (
            <button key={value} type="button" className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{label}</button>
          ))}
        </div>
      )}

      {filtered.length ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-media">
                <img src={product.image || product.images?.[0]} alt={product.name} loading="lazy" />
                <span className="stock-pill">{Number(product.stock) > 0 ? 'IN STOCK' : 'OUT OF STOCK'}</span>
                <div className="quick-actions">
                  <button type="button" onClick={() => setQuick(product)}><Eye size={15} /> QUICK VIEW</button>
                  <button type="button" disabled={Number(product.stock) <= 0} onClick={() => onAdd(product)}><ShoppingBag size={15} /> ADD</button>
                </div>
              </div>
              <button type="button" className="product-info product-info-button" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
                <div><span>{product.brand || 'NOVIS'} · {product.type} · {product.size}</span><h2>{product.name}</h2></div>
                <strong>${Number(product.price).toLocaleString()}</strong>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="collection-empty">
          <PackageOpen size={28} />
          <span className="eyebrow">COLLECTION UPDATE</span>
          <h2>No timepieces here yet.</h2>
          <p>This collection is ready for products from the NOVIS administration panel.</p>
          <Link className="lux-btn" to="/">RETURN TO NOVIS</Link>
        </div>
      )}

      {quick && (
        <div className="quick-modal" onClick={() => setQuick(null)}>
          <div className="quick-card" onClick={(event) => event.stopPropagation()}>
            <button className="quick-close" type="button" onClick={() => setQuick(null)} aria-label="Close quick view"><X /></button>
            <img src={quick.image || quick.images?.[0]} alt={quick.name} />
            <div>
              <span className="eyebrow">QUICK VIEW</span>
              <h2>{quick.name}</h2>
              <p className="spec">{quick.brand || 'NOVIS'} · {quick.type} · {quick.size}</p>
              <strong className="quick-price">${Number(quick.price).toLocaleString()}</strong>
              <p>{quick.description}</p>
              <div className="quick-buttons">
                <button className="lux-btn gold" type="button" disabled={Number(quick.stock) <= 0} onClick={() => { onAdd(quick); setQuick(null); }}>{Number(quick.stock) > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}</button>
                <button className="lux-btn" type="button" onClick={() => onOpen(quick)}>VIEW FULL DETAILS</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
