import { Watch, Order } from "./types";

const img = (seed: string) => `https://unsplash.com{seed}?auto=format&fit=crop&w=1200&q=85`;

export const initialWatches: Watch[] = [
  { 
    id: "lotus-chrono", 
    name: "Lotus Chrono", 
    type: "Men's Leather", 
    regularPrice: 9999, 
    salePrice: 7999, 
    costPrice: 4000, 
    discount: 20, 
    images: [img("1524805444758-089113d48a6d"), img("1523170335258-f5ed11844a49"), img("1508057198894-247b23fe5ade")], 
    stock: 18, 
    unitsSold: 42, 
    longDescription: "A refined chronograph-inspired timepiece pairing a polished case with an authentic leather strap. Designed for everyday luxury and formal evenings.", 
    features: ["1-Year International Warranty", "30 Days Hassle-free returns", "Premium chronograph styling", "Quartz precision movement"], 
    movement: "Japanese Quartz Chronograph", 
    strap: "Authentic Leather", 
    waterResistance: "50M" 
  },
  { 
    id: "solano-shield", 
    name: "Solano Shield", 
    type: "Men's Stainless Steel", 
    regularPrice: 14999, 
    salePrice: 11999, 
    costPrice: 5500, 
    discount: 20, 
    images: [img("1523275335684-37898b6baf30"), img("1547996160-81dfa63595aa"), img("1524592094714-0f0654e20314")], 
    stock: 9, 
    unitsSold: 71, 
    longDescription: "A confident steel silhouette with a clean dial and durable bracelet, built for a sharp daily rotation.", 
    features: ["1-Year International Warranty", "30 Days Hassle-free returns", "316L-style steel bracelet", "Scratch-resistant mineral glass"], 
    movement: "Japanese Quartz", 
    strap: "Stainless Steel", 
    waterResistance: "50M" 
  },
  { 
    id: "axre-grace", 
    name: "Axre Grace", 
    type: "Women's Stainless Steel", 
    regularPrice: 17999, 
    salePrice: 10999, 
    costPrice: 5000, 
    discount: 38, 
    images: [img("1522312346375-d1a52e2b99b3"), img("1509048191080-d2f4c6a7d3cc"), img("1524805444758-089113d48a6d")], 
    stock: 0, 
    unitsSold: 58, 
    longDescription: "An elegant women's steel watch balancing a compact case, luminous detailing and a polished bracelet for understated occasion wear.", 
    features: ["1-Year International Warranty", "30 Days Hassle-free returns", "Elegant compact case", "Comfort-fit steel bracelet"], 
    movement: "Japanese Quartz", 
    strap: "Stainless Steel", 
    waterResistance: "30M" 
  },
  { 
    id: "empire-prestige", 
    name: "Empire 1.0 Prestige", 
    type: "Couple's Stainless Steel", 
    regularPrice: 51499, 
    salePrice: 25999, 
    costPrice: 12000, 
    discount: 49, 
    images: [img("1523275335684-37898b6baf30"), img("1539874754764-5a96559165b0"), img("1547996160-81dfa63595aa")], 
    stock: 4, 
    unitsSold: 23, 
    longDescription: "A coordinated couple's set created for milestones, gifting and shared occasions, with matching steel profiles and premium presentation.", 
    features: ["1-Year International Warranty", "30 Days Hassle-free returns", "Matching couple set", "Premium gift-ready presentation"], 
    movement: "Japanese Quartz", 
    strap: "Stainless Steel", 
    waterResistance: "30M" 
  }
];

export const initialOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Alex Mercer",
    email: "alex@example.com",
    watchId: "lotus-chrono",
    quantity: 1,
    totalAmount: 7999,
    status: "Delivered",
    createdAt: "2026-09-15T10:30:00Z"
  },
  {
    id: "ORD-002",
    customerName: "Sarah Connor",
    email: "sarah@example.com",
    watchId: "solano-shield",
    quantity: 2,
    totalAmount: 23998,
    status: "Processing",
    createdAt: "2026-09-22T14:15:00Z"
  },
  {
    id: "ORD-003",
    customerName: "Bruce Wayne",
    email: "bruce@waynecorp.com",
    watchId: "empire-prestige",
    quantity: 1,
    totalAmount: 25999,
    status: "Pending",
    createdAt: "2026-09-23T08:45:00Z"
  }
];
