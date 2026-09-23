"use client";
import { createContext, useContext, useState } from "react";

type Item = { id: string; quantity: number };
type Ctx = {
  cart: Item[];
  add: (id: string, q?: number) => void;
  setQty: (id: string, q: number) => void;
  remove: (id: string) => void;
  clearCart: () => void;
  openProduct: (p: any) => void;
  selected: any;
};

const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Item[]>([]);
  const [selected, setSelected] = useState<any>(null);

  function add(id: string, q = 1) {
    if (q < 1) return;
    setCart((current) => {
      const existing = current.find((item) => item.id === id);
      return existing
        ? current.map((item) => item.id === id ? { ...item, quantity: item.quantity + q } : item)
        : [...current, { id, quantity: q }];
    });
  }

  function setQty(id: string, q: number) {
    setCart((current) => q <= 0
      ? current.filter((item) => item.id !== id)
      : current.map((item) => item.id === id ? { ...item, quantity: q } : item));
  }

  return (
    <C.Provider value={{
      cart,
      add,
      setQty,
      remove: (id) => setQty(id, 0),
      clearCart: () => setCart([]),
      openProduct: setSelected,
      selected,
    }}>
      {children}
    </C.Provider>
  );
}

export function useStore() {
  const value = useContext(C);
  if (!value) throw new Error("StoreProvider missing");
  return value;
}
