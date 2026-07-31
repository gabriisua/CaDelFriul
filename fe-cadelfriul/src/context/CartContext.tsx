"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stockQuantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  cartTotal: number;
  itemCount: number;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getMaxQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "cadelfriul_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (mounted.current) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addToCart = useCallback(
      (
          item: Omit<CartItem, "quantity"> & { quantity?: number }
      ) => {
        const qty = item.quantity ?? 1;
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === item.productId);
          if (existing) {
            const maxQty = item.stockQuantity ?? existing.stockQuantity ?? Infinity;
            const newQty = Math.min(existing.quantity + qty, maxQty);
            return prev.map((i) =>
                i.productId === item.productId
                    ? { ...i, quantity: newQty }
                    : i
            );
          }
          return [...prev, { ...item, quantity: qty }];
        });
      },
      []
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getMaxQuantity = useCallback(
      (productId: string): number => {
        const item = items.find((i) => i.productId === productId);
        return item?.stockQuantity ?? Infinity;
      },
      [items]
  );

  const cartTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
      <CartContext.Provider
          value={{
            items,
            cartTotal,
            itemCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getMaxQuantity,
          }}
      >
        {children}
      </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}