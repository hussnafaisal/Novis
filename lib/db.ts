import { promises as fs } from "node:fs";
import path from "node:path";
import { initialWatches } from "./data";
import type { Order, Watch } from "./types";

type User = { id: string; name: string; email: string; passwordHash: string; createdAt: string };
type Product = Watch & { active: boolean; createdAt: string };
type OrderRecord = Order & { userId: string };
type ContactMessage = { id:string; name:string; email:string; phone?:string; subject:string; message:string; createdAt:string };
type Store = { users: User[]; products: Product[]; orders: OrderRecord[]; contacts: ContactMessage[]; usage: { messages:number; tokens:number; plan:string; last7Days:number[] } };

const file = path.join(process.cwd(), "data", "store.json");
let queue = Promise.resolve();

function seedStore(): Store {
  const now = new Date().toISOString();
  return {
    users: [],
    products: initialWatches.map((watch, index) => ({ ...watch, active: true, createdAt: new Date(Date.now() + index).toISOString() })),
    orders: [],
    contacts: [],
    usage: { messages: 0, tokens: 0, plan: "Premium Admin Workspace", last7Days: [] }
  };
}

async function ensureStore() {
  await fs.mkdir(path.dirname(file), { recursive: true });
  try { await fs.access(file); } catch { await fs.writeFile(file, JSON.stringify(seedStore(), null, 2)); }
}

async function readStore(): Promise<Store> {
  await ensureStore();
  const raw = await fs.readFile(file, "utf8");
  const store = JSON.parse(raw) as Store;
  if (!store.products?.length) store.products = seedStore().products;
  if (!store.orders?.length) store.orders = seedStore().orders as OrderRecord[];
  store.orders = store.orders.map((o:any) => ({
    ...o,
    invoiceId: o.invoiceId ?? (o.status !== "Pending" ? `INV-${String(o.id).replace(/^ORD-/, "")}` : null),
    confirmedAt: o.confirmedAt ?? null,
    deliveredAt: o.deliveredAt ?? null,
    returnedAt: o.returnedAt ?? null,
    items: (o.items || []).map((item:any) => ({
      ...item,
      unitPrice: Number(item.unitPrice ?? 0),
    }))
  }));
  if (!store.users) store.users = [];
  if (!store.contacts) store.contacts = [];
  return store;
}

function writeStore(store: Store) {
  queue = queue.then(async () => {
    await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
  });
  return queue;
}

export const db = {
  user: {
    async findUnique({ where }: { where: { id?: string; email?: string } }) {
      const store = await readStore();
      return store.users.find(u => where.id ? u.id === where.id : u.email?.toLowerCase() === where.email?.toLowerCase()) ?? null;
    },
    async create({ data }: { data: { name:string; email:string; passwordHash:string } }) {
      const store = await readStore();
      if (store.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) throw new Error("A user with this email already exists.");
      const user: User = { id: `usr_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, ...data, email: data.email.toLowerCase(), createdAt: new Date().toISOString() };
      store.users.push(user); await writeStore(store); return user;
    }
  },
  product: {
    async findMany({ where, orderBy }: { where?: { active?: boolean }; orderBy?: { name?: "asc"|"desc"; createdAt?: "asc"|"desc" } } = {}) {
      const store = await readStore();
      let items = store.products.filter(p => where?.active === undefined || p.active === where.active);
      if (orderBy?.name) items.sort((a,b) => a.name.localeCompare(b.name) * (orderBy.name === "desc" ? -1 : 1));
      if (orderBy?.createdAt) items.sort((a,b) => (a.createdAt.localeCompare(b.createdAt)) * (orderBy.createdAt === "desc" ? -1 : 1));
      return items;
    },
    async findUnique({ where }: { where: { id:string } }) { const store = await readStore(); return store.products.find(p => p.id === where.id) ?? null; },
    async create({ data }: { data: Partial<Watch> & { name:string; type:string } }) {
      const store = await readStore();
      const product: Product = {
        id: data.id || `watch_${Date.now()}`,
        name: data.name, type: data.type, regularPrice: data.regularPrice ?? 0, salePrice: data.salePrice ?? 0,
        costPrice: data.costPrice ?? 0, discount: data.discount ?? 0, images: data.images ?? [], stock: data.stock ?? 0,
        unitsSold: data.unitsSold ?? 0, longDescription: data.longDescription ?? "", features: data.features ?? [],
        movement: data.movement ?? "Japanese Quartz", strap: data.strap ?? "Stainless Steel", waterResistance: data.waterResistance ?? "30M",
        active: true, createdAt: new Date().toISOString()
      };
      store.products.push(product); await writeStore(store); return product;
    },
    async update({ where, data }: { where:{id:string}; data:Partial<Product> & { stock?:number; unitsSold?:number; active?:boolean } }) {
      const store = await readStore(); const index = store.products.findIndex(p => p.id === where.id); if (index < 0) throw new Error("Product not found.");
      store.products[index] = { ...store.products[index], ...data }; await writeStore(store); return store.products[index];
    }
  },
  contact: {
    async create({ data }: { data: ContactMessage }) {
      const store = await readStore();
      store.contacts.push(data);
      await writeStore(store);
      return data;
    },
    async findMany() { const store = await readStore(); return [...store.contacts].reverse(); }
  },
  order: {
    async findMany({ orderBy }: { include?: unknown; orderBy?: { createdAt?: "asc"|"desc" } } = {}) {
      const store = await readStore();
      const users = new Map(store.users.map(u => [u.id, u]));
      let items = store.orders.map(o => ({ ...o, user: users.get(o.userId) ?? { name: o.customer, email: o.email }, createdAt: new Date(o.createdAt) }));
      if (orderBy?.createdAt) items.sort((a,b) => (a.createdAt.getTime()-b.createdAt.getTime()) * (orderBy.createdAt === "desc" ? -1 : 1));
      return items;
    },
    async findUnique({ where }:{where:{id:string}}) { const store=await readStore(); return store.orders.find(o=>o.id===where.id) ?? null; },
    async create({ data }:{data:OrderRecord}) { const store=await readStore(); store.orders.push(data); await writeStore(store); return data; },
    async update({ where, data }:{where:{id:string};data:Partial<OrderRecord>}) { const store=await readStore(); const i=store.orders.findIndex(o=>o.id===where.id); if(i<0)throw new Error("Order not found."); store.orders[i]={...store.orders[i],...data}; await writeStore(store); return store.orders[i]; }
  },
  async usage() {
    const store = await readStore();
    const now = Date.now();
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const start = new Date(now - (6 - index) * 86400000); start.setHours(0,0,0,0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      return Number(store.usage.last7Days?.[index] || 0);
    });
    return { messages: Number(store.usage.messages || 0), tokens: Number(store.usage.tokens || 0), plan: store.usage.plan || "Premium Admin Workspace", last7Days };
  },
  async recordChat(tokens: number) {
    const store = await readStore();
    const day = new Date().getDay();
    const index = (day + 6) % 7;
    const days = Array.from({ length: 7 }, (_, i) => Number(store.usage.last7Days?.[i] || 0));
    days[index] = Number(days[index] || 0) + 1;
    store.usage.messages = Number(store.usage.messages || 0) + 1;
    store.usage.tokens = Number(store.usage.tokens || 0) + Math.max(0, Math.floor(tokens));
    store.usage.last7Days = days;
    await writeStore(store);
  }
};
