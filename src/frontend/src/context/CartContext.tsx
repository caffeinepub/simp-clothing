import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export interface CartProduct {
  id: number;
  name: string;
  priceCents: number;
  image: string;
  category: string;
  size?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  subtotalCents: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: number, size?: string) => void;
  updateQty: (productId: number, qty: number, size?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((product: CartProduct) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.product.size === product.size,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.product.size === product.size
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: number, size?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product.id === productId && i.product.size === size),
      ),
    );
  }, []);

  const updateQty = useCallback(
    (productId: number, qty: number, size?: string) => {
      if (qty <= 0) {
        setItems((prev) =>
          prev.filter(
            (i) => !(i.product.id === productId && i.product.size === size),
          ),
        );
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId && i.product.size === size
            ? { ...i, quantity: qty }
            : i,
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.product.priceCents * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotalCents,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
