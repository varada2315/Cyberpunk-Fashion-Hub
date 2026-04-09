import {
  createContext,
  useContext,
  useState,
  useEffect,
  createElement,
  type ReactNode,
} from "react";

interface CartItem {
  product: any;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
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
    setCartItems(prev => {
      const newVariantKey = getVariantKey(product);
      const existingItem = prev.find(item => getVariantKey(item.product) === newVariantKey);
      if (existingItem) {
        return prev.map(item => 
          getVariantKey(item.product) === newVariantKey
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
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
          ? { ...item, quantity } 
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
