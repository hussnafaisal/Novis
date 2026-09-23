"use client";

import {
createContext,
useContext,
useEffect,
useMemo,
useState,
type ReactNode,
} from "react";

import { initialOrders, initialWatches } from "./data";
import type { CartItem, Order, Watch } from "./types";

type StoreContextValue = {
watches: Watch[];
cart: CartItem[];
orders: Order[];
selectedWatch: Watch | null;
cartOpen: boolean;
checkoutActive: boolean;
authenticated: boolean;
adminAuthenticated: boolean;

setSelectedWatch: (watch: Watch | null) => void;
setCartOpen: (open: boolean) => void;

addToCart: (id: string, quantity?: number) => boolean;
updateCart: (id: string, quantity: number) => void;
removeFromCart: (id: string) => void;

cartCount: number;
subtotal: number;

setCheckoutActive: (active: boolean) => void;

signIn: () => void;
signOut: () => void;

adminSignIn: (username: string, password: string) => boolean;
adminSignOut: () => void;

addWatch: (watch: Watch) => void;
removeWatch: (id: string) => void;
updateStock: (id: string, stock: number) => void;

updateOrderStatus: (
id: string,
status: Order["status"]
) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
children,
}: {
children: ReactNode;
}) {
const [watches, setWatches] = useState<Watch[]>(initialWatches);
const [cart, setCart] = useState<CartItem[]>([]);
const [orders, setOrders] = useState<Order[]>(initialOrders);

const [selectedWatch, setSelectedWatch] =
useState<Watch | null>(null);

const [cartOpen, setCartOpen] = useState(false);
const [checkoutActive, setCheckoutActive] = useState(false);

const [authenticated, setAuthenticated] = useState(false);
const [adminAuthenticated, setAdminAuthenticated] =
useState(false);

// Load saved sessions and cart
useEffect(() => {
try {
const savedCart = localStorage.getItem("Novis-cart");

  if (savedCart) {
    setCart(JSON.parse(savedCart) as CartItem[]);
  }

  setAuthenticated(
    localStorage.getItem("Novis-customer-auth") === "1"
  );

  setAdminAuthenticated(
    sessionStorage.getItem("Novis-admin-auth") === "1"
  );
} catch (error) {
  console.error("Failed to load saved store data:", error);
}

}, []);

// Save cart
useEffect(() => {
try {
localStorage.setItem(
"Novis-cart",
JSON.stringify(cart)
);
} catch (error) {
console.error("Failed to save cart:", error);
}
}, [cart]);

// Add product to cart
const addToCart = (
id: string,
quantity = 1
): boolean => {
const watch = watches.find(
(item) => item.id === id
);

if (!watch || watch.stock <= 0 || quantity <= 0) {
  return false;
}

const existing = cart.find(
  (item) => item.watchId === id
);

const currentQuantity =
  existing?.quantity ?? 0;

if (
  currentQuantity + quantity >
  watch.stock
) {
  return false;
}

setCart((current) => {
  const alreadyInCart = current.find(
    (item) => item.watchId === id
  );

  if (alreadyInCart) {
    return current.map((item) =>
      item.watchId === id
        ? {
            ...item,
            quantity:
              item.quantity + quantity,
          }
        : item
    );
  }

  return [
    ...current,
    {
      watchId: id,
      quantity,
    },
  ];
});

return true;


};

// Update cart quantity
const updateCart = (
id: string,
quantity: number
) => {
const watch = watches.find(
(item) => item.id === id
);

if (!watch) return;

setCart((current) => {
  if (quantity <= 0) {
    return current.filter(
      (item) => item.watchId !== id
    );
  }

  return current.map((item) => {
    if (item.watchId !== id) {
      return item;
    }

    return {
      ...item,
      quantity: Math.min(
        quantity,
        watch.stock
      ),
    };
  });
});

};

// Remove cart item
const removeFromCart = (id: string) => {
setCart((current) =>
current.filter(
(item) => item.watchId !== id
)
);
};

// Cart item count
const cartCount = useMemo(
() =>
cart.reduce(
(total, item) =>
total + item.quantity,
0
),
[cart]
);

// Cart subtotal
const subtotal = useMemo(() => {
return cart.reduce(
(total, item) => {
const watch = watches.find(
(product) =>
product.id === item.watchId
);

    if (!watch) return total;

    return (
      total +
      watch.salePrice *
        item.quantity
    );
  },
  0
);

}, [cart, watches]);

// Customer login
const signIn = () => {
localStorage.setItem(
"Novis-customer-auth",
"1"
);

setAuthenticated(true);

};

// Customer logout
const signOut = () => {
localStorage.removeItem(
"Novis-customer-auth"
);


setAuthenticated(false);


};

// Admin login
const adminSignIn = (
username: string,
password: string
) => {
const adminUsername =
process.env.NEXT_PUBLIC_ADMIN_USERNAME ??
"muttahir";


const adminPassword =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ??
  "muttahir123@";

const valid =
  username.trim() === adminUsername &&
  password === adminPassword;

if (!valid) {
  return false;
}

sessionStorage.setItem(
  "Novis-admin-auth",
  "1"
);

setAdminAuthenticated(true);

return true;


};

// Admin logout
const adminSignOut = () => {
sessionStorage.removeItem(
"Novis-admin-auth"
);


setAdminAuthenticated(false);


};

// Add product
const addWatch = (watch: Watch) => {
setWatches((current) => [
...current,
watch,
]);
};

// Delete product
const removeWatch = (id: string) => {
setWatches((current) =>
current.filter(
(watch) => watch.id !== id
)
);


// Also remove deleted product from cart
setCart((current) =>
  current.filter(
    (item) => item.watchId !== id
  )
);


};

// Update stock
const updateStock = (
id: string,
stock: number
) => {
const safeStock = Math.max(
0,
Math.floor(stock)
);


setWatches((current) =>
  current.map((watch) =>
    watch.id === id
      ? {
          ...watch,
          stock: safeStock,
        }
      : watch
  )
);

// Prevent cart quantity from exceeding new stock
setCart((current) =>
  current
    .map((item) => {
      if (item.watchId !== id) {
        return item;
      }

      return {
        ...item,
        quantity: Math.min(
          item.quantity,
          safeStock
        ),
      };
    })
    .filter(
      (item) => item.quantity > 0
    )
);


};

// Update order status
const updateOrderStatus = (
id: string,
status: Order["status"]
) => {
setOrders((current) =>
current.map((order) =>
order.id === id
? {
...order,
status,
}
: order
)
);
};

return (
<StoreContext.Provider
value={{
watches,
cart,
orders,


    selectedWatch,
    cartOpen,
    checkoutActive,

    authenticated,
    adminAuthenticated,

    setSelectedWatch,
    setCartOpen,

    addToCart,
    updateCart,
    removeFromCart,

    cartCount,
    subtotal,

    setCheckoutActive,

    signIn,
    signOut,

    adminSignIn,
    adminSignOut,

    addWatch,
    removeWatch,
    updateStock,
    updateOrderStatus,
  }}
>
  {children}
</StoreContext.Provider>


);
}

export function useStore() {
const value = useContext(StoreContext);

if (!value) {
throw new Error(
"useStore must be used within StoreProvider"
);
}

return value;
}
