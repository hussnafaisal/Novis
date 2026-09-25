import Link from "next/link";
import { ArrowRight, Download, Filter } from "lucide-react";
import { db } from "@/lib/db";
import { parseProduct } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default async function CollectionsPage() {
  const products = (await db.product.findMany({ where: { active: true }, orderBy: { name: "asc" } })).map(parseProduct);
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.type)))];

  return <main className="collection-page">
    <section className="collection-hero">
      <div className="section-heading">
        <p className="eyebrow">THE NOVIS COLLECTION</p>
        <h1>Every Novis watch.<br/><span>In one considered collection.</span></h1>
        <p>Explore the complete active catalogue, compare pieces, inspect specifications and add any timepiece directly to your bag.</p>
        <div className="collection-actions">
          <a href="/api/catalog/pdf" className="gold-button"><Download size={15}/> Download catalogue PDF</a>
          <Link href="/#latest" className="outline-button">Back to home <ArrowRight size={15}/></Link>
        </div>
      </div>
    </section>

    <section className="section-shell collection-shell">
      <div className="collection-toolbar">
        <div><p className="eyebrow">COMPLETE CATALOGUE</p><h2>All watches</h2></div>
        <div className="catalog-count"><Filter size={14}/> {products.length} timepieces</div>
      </div>
      <div className="collection-filters">{categories.map((category, i) => <span key={category} className={i === 0 ? "active" : ""}>{category}</span>)}</div>
      <div className="product-grid collection-grid">{products.map((p) => <ProductCard key={p.id} p={p}/>)}</div>
      {!products.length && <div className="empty-catalog">No active watches are currently available.</div>}
    </section>
    <Footer/>
  </main>;
}
