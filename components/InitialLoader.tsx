"use client";

import { useEffect, useState } from "react";

const watches = [
  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=88",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=88",
  "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=700&q=88",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=700&q=88",
  "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=700&q=88",
];

export default function InitialLoader() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setIndex((i) => (i + 1) % watches.length), 430);
    const timeout = window.setTimeout(() => setVisible(false), 2500);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="novis-loader" aria-label="Loading Novis Timepieces" role="status">
      <div className="loader-orbit orbit-one" />
      <div className="loader-orbit orbit-two" />
      <div className="loader-watch-stage">
        {watches.map((src, i) => (
          <img key={src} src={src} alt="" className={`loader-watch ${i === index ? "is-active" : ""}`} />
        ))}
      </div>
      <div className="loader-brand"><span>N</span><strong>NOVIS</strong><small>TIMEPIECES</small></div>
      <div className="loader-progress"><span /></div>
      <p>CRAFTED TO KEEP TIME</p>
    </div>
  );
}
