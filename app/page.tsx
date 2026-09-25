import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Crown, Gem, ShieldCheck, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { parseProduct } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import QuickView from "@/components/QuickView";
import AIAdvisor from "@/components/AIAdvisor";
import Footer from "@/components/Footer";

export default async function Home() {
  const products = (await db.product.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } })).map(parseProduct);
  const latest = [...products].reverse();
  const categories = [
    { name: "Men's Watches", image: products.find(p => p.type === "Men's Watches")?.images?.[0] || products[0]?.images?.[0] },
    { name: "Women's Watches", image: products.find(p => p.type === "Women's Watches")?.images?.[0] || products[2]?.images?.[0] },
    { name: "Sports Watches", image: products.find(p => p.type === "Sports Watches")?.images?.[0] || products[5]?.images?.[0] },
    { name: "Couple's Watches", image: products.find(p => p.type === "Couple's Watches")?.images?.[0] || products[3]?.images?.[0] },
    { name: "Limited Edition", image: products.find(p => p.type === "Limited Edition")?.images?.[0] || products[4]?.images?.[0] },
  ];
  const hero = products[0];

  return <main>
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-copy">
        <p className="eyebrow">THE NOVIS WATCH HOUSE</p>
        <h1>Timeless luxury.<br /><span>Crafted for you.</span></h1>
        <p className="hero-text">Precision timepieces designed with quiet confidence, refined materials and a standard that does not need to shout.</p>
        <div className="hero-actions"><Link href="#collections" className="gold-button">Shop Collection <ArrowRight size={16}/></Link><Link href="#latest" className="outline-button">Explore New Arrivals</Link></div>
        <div className="hero-points"><span><Check size={14}/> Authentic timepieces</span><span><Check size={14}/> International warranty</span></div>
      </div>
      <div className="hero-watch">
        <div className="hero-ring" />
        {hero && <img src={hero.images[0]} alt={hero.name} />}
        <div className="hero-badge"><Crown size={18}/><strong>AUTHENTIC</strong><span>Novis Timepieces</span></div>
      </div>
    </section>

    <section className="assurance-strip"><div><Truck/><strong>Free Shipping</strong><span>On qualifying orders</span></div><div><ShieldCheck/><strong>1-Year Warranty</strong><span>International coverage</span></div><div><ArrowRight/><strong>Easy Returns</strong><span>30-day return policy</span></div><div><Gem/><strong>Premium Quality</strong><span>Carefully selected pieces</span></div></section>

    <section id="collections" className="section-shell">
      <SectionHeading eyebrow="THE COLLECTION" title="Shop by category" text="A considered selection of watches for work, weekends, milestones and everything between." />
      <div className="category-grid">{categories.map(c => <Link href="#latest" key={c.name} className="category-card"><img src={c.image} alt={c.name}/><div><h3>{c.name}</h3><span>Explore collection <ArrowRight size={13}/></span></div></Link>)}</div>
    </section>

    <section id="latest" className="section-shell section-dark">
      <SectionHeading eyebrow="NOVIS EDIT" title="Best sellers" text="The pieces customers keep coming back for, presented with the details that matter." />
      <div className="product-grid">{products.slice(0, 6).map(p => <ProductCard key={p.id} p={p}/>)}</div>
      <div className="center-action"><Link href="#collections" className="outline-button">View the full collection <ArrowRight size={16}/></Link></div>
    </section>

    <section className="section-shell feature-banners"><Promo title="Limited time offer" heading="Up to 25% off selected pieces" image={products[5]?.images?.[0]} action="Shop offers"/><Promo title="The latest edit" heading="New arrivals, chosen for now" image={latest[0]?.images?.[0]} action="Discover new arrivals"/><Promo title="For every moment" heading="A gift that keeps time" image={products[4]?.images?.[0]} action="Shop gifts"/></section>

    <section className="section-shell craftsmanship"><div className="craft-image">{products[1] && <img src={products[1].images[1] || products[1].images[0]} alt="Novis watch craftsmanship"/>}</div><div className="craft-copy"><p className="eyebrow">THE NOVIS STANDARD</p><h2>Made to be worn.<br/><span>Made to be remembered.</span></h2><p>Every Novis piece is selected around proportion, legibility, material quality and everyday wearability. The result is a collection that looks considered without becoming precious.</p><div className="craft-list"><span><Check size={16}/> Thoughtful proportions</span><span><Check size={16}/> Reliable movements</span><span><Check size={16}/> Gift-ready presentation</span><span><Check size={16}/> Clear product information</span></div><Link href="/about" className="text-link">Discover the Novis standard <ArrowRight size={15}/></Link></div></section>

    <section className="brand-section"><SectionHeading eyebrow="THE NOVIS HOUSE" title="A signature point of view" text="Luxury does not require visual noise. Our black-and-gold identity keeps the product at the center." /><div className="brand-grid"><div><span>01</span><h3>Precision</h3><p>Clear specifications and reliable movements.</p></div><div><span>02</span><h3>Presence</h3><p>Balanced cases, considered finishes and strong silhouettes.</p></div><div><span>03</span><h3>Service</h3><p>Responsive support from selection through delivery.</p></div></div></section>

    <section className="testimonial-section"><SectionHeading eyebrow="CUSTOMER NOTES" title="What customers say" /><div className="testimonial-grid"><Review name="James R." text="The watch arrived beautifully presented and the details matched the product page exactly."/><Review name="Sophia M." text="Clean ordering experience, helpful support and a very polished timepiece."/><Review name="Daniel K." text="The finish is understated and elegant. It works equally well for work and formal occasions."/></div></section>

    <section className="advisor-section"><SectionHeading eyebrow="NOVIS CONCIERGE" title="Find the watch that fits the moment" text="Use the AI advisor for questions about style, specifications, budget, gifting and warranty."/><AIAdvisor/></section>
    <Footer/><QuickView/>
  </main>;
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) { return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p>{text}</p>}</div>; }
function Promo({ title, heading, image, action }: { title:string; heading:string; image?:string; action:string }) { return <Link href="#latest" className="promo"><img src={image} alt=""/><div><p>{title}</p><h3>{heading}</h3><span>{action} <ChevronRight size={14}/></span></div></Link>; }
function Review({ name, text }: {name:string;text:string}) { return <article className="review"><div className="stars">★★★★★</div><p>“{text}”</p><strong>{name}</strong></article>; }
