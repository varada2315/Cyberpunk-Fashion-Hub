import {
  createContext,
  useContext,
  useState,
  useEffect,
  createElement,
  type ReactNode,
} from "react";
import { getVariantStock } from "@/lib/stock";

interface CartItem {
  product: any;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => boolean;
  removeFromCart: (productId: number, selectedColor?: string, selectedSize?: string) => void;
  updateQuantity: (productId: number, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const getVariantKey = (product: any) =>
    `${product.id}::${product.selectedColor ?? ""}::${product.selectedSize ?? ""}`;
  const getSelectedVariantStock = (product: any) =>
    getVariantStock(product, product.selectedColor ?? null, product.selectedSize ?? null);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = (product: any) => {
    let wasAdded = false;
    setCartItems(prev => {
      const stockLimit = getSelectedVariantStock(product);
      if (stockLimit !== null && stockLimit <= 0) {
        return prev;
      }

      const newVariantKey = getVariantKey(product);
      const existingItem = prev.find(item => getVariantKey(item.product) === newVariantKey);
      if (existingItem) {
        if (stockLimit !== null && existingItem.quantity >= stockLimit) {
          return prev;
        }
        wasAdded = true;
        return prev.map(item => 
          getVariantKey(item.product) === newVariantKey
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        wasAdded = true;
        return [...prev, { product, quantity: 1 }];
      }
    });
    return wasAdded;
  };

  const removeFromCart = (productId: number, selectedColor?: string, selectedSize?: string) => {
    const targetVariantKey = `${productId}::${selectedColor ?? ""}::${selectedSize ?? ""}`;
    setCartItems(prev => prev.filter(item => getVariantKey(item.product) !== targetVariantKey));
  };

  const updateQuantity = (productId: number, quantity: number, selectedColor?: string, selectedSize?: string) => {
    if (quantity < 1) return;
    const targetVariantKey = `${productId}::${selectedColor ?? ""}::${selectedSize ?? ""}`;
    setCartItems(prev => 
      prev.map(item => 
        getVariantKey(item.product) === targetVariantKey
          ? (() => {
              const stockLimit = getSelectedVariantStock(item.product);
              const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1;
              const normalized = Math.max(1, safeQuantity);
              if (stockLimit !== null) {
                if (stockLimit < 1) return item;
                return { ...item, quantity: Math.min(normalized, stockLimit) };
              }
              return { ...item, quantity: normalized };
            })()
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return createElement(CartContext.Provider, { value }, children);
}
