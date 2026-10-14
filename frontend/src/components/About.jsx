import { Mail, ShieldCheck, Sparkles, Watch } from 'lucide-react';

export default function About() {
  return (
    <div className="static-page novis-about-page">
      <header className="static-hero about-hero">
        <span className="eyebrow">OUR PHILOSOPHY · OUR PROMISE</span>
        <h1>Time, with <em>intention.</em></h1>
        <p>Meet NOVIS — a modern watch collection built around considered design, everyday confidence, and the moments worth remembering.</p>
      </header>
      <div className="static-content about-content">
        <section className="about-intro">
          <span className="eyebrow">ABOUT THE BRAND</span>
          <h2>More than a way to tell time.</h2>
          <p>NOVIS brings together timeless style and a contemporary point of view. We believe a great timepiece should feel right in the everyday — refined enough for special occasions, versatile enough to become part of your signature.</p>
          <p>Our online collection is curated with a focus on clean design, distinctive details, and value you can feel good about. From choosing a piece to asking a question after your order, we aim to make every interaction clear, thoughtful, and personal.</p>
        </section>
        <section className="about-values">
          <article><Watch aria-hidden="true"/><h3>Considered design</h3><p>Balanced proportions and versatile looks, chosen to complement your own style.</p></article>
          <article><ShieldCheck aria-hidden="true"/><h3>Customer-first service</h3><p>Clear communication and helpful support throughout your shopping experience.</p></article>
          <article><Sparkles aria-hidden="true"/><h3>Everyday distinction</h3><p>Timepieces selected to make daily moments feel a little more special.</p></article>
        </section>
        <section className="about-owner">
          <span className="eyebrow">A NOTE FROM THE OWNER</span>
          <h2>Muttahir Saeed</h2>
          <p>“NOVIS is built on a simple idea: personal style lives in the details. Our goal is to offer a thoughtful online shopping experience and timepieces that customers are proud to make their own.”</p>
          <span className="about-signoff">Founder · NOVIS Timepieces</span>
          <a href="mailto:Noviscollection@gmail.com"><Mail size={16}/> Noviscollection@gmail.com</a>
        </section>
      </div>
    </div>
  );
}
