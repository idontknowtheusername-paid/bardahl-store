import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, quantity?: number, cupSize?: string) => void;
  removeItem: (productId: string, size: string, color: string, cupSize?: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number, cupSize?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bardahl-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const getItemKey = (productId: string, size: string, color: string, cupSize?: string) => {
    return `${productId}-${size}-${color}${cupSize ? `-${cupSize}` : ''}`;
  };

  const addItem = (product: Product, size: string, color: string, quantity = 1, cupSize?: string) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        item =>
          item.product.id === product.id &&
          item.size === size &&
          item.color === color &&
          item.cupSize === cupSize
      );

      if (existingIndex > -1) {
        const updated = [...current];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...current, { product, size, color, quantity, cupSize }];
    });

    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
      duration: 3000,
    });
  };

  const removeItem = (productId: string, size: string, color: string, cupSize?: string) => {
    setItems(current =>
      current.filter(
        item =>
          !(item.product.id === productId &&
            item.size === size &&
            item.color === color &&
            item.cupSize === cupSize)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number, cupSize?: string) => {
    if (quantity <= 0) {
      removeItem(productId, size, color, cupSize);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.product.id === productId &&
        item.size === size &&
        item.color === color &&
        item.cupSize === cupSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
