export type Watch = {
  id: string;
  name: string;
  type: string;
  regularPrice: number;
  salePrice: number;
  costPrice: number;
  discount: number;
  images: string[];
  stock: number;
  unitsSold: number;
  longDescription: string;
  features: string[];
  movement: string;
  strap: "Stainless Steel" | "Authentic Leather" | "Rubber";
  waterResistance: string;
};

export type CartItem = { watchId: string; quantity: number };

export type OrderItem = CartItem & {
  unitPrice: number;
  productName?: string;
  productImage?: string;
};

export type Order = {
  id: string;
  invoiceId?: string | null;
  customer: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  total: number;
  status: "Pending" | "Confirmed" | "Delivered";
  createdAt: string;
  confirmedAt?: string | null;
  items: OrderItem[];
};
