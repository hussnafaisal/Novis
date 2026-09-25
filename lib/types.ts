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
  status: "Pending" | "Confirmed" | "Out for Delivery" | "Delivered" | "Return";
  createdAt: string;
  confirmedAt?: string | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  items: OrderItem[];
};
