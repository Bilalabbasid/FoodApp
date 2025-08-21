import { useMemo } from 'react';
import { useCartStore } from '../store/cartStore';

export function useCart() {
  const { items, summary, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

  const cartSummary = useMemo(() => {
    if (summary) return summary;

    const subtotal = items.reduce((total, item) => total + item.totalPrice, 0);
    const total = subtotal; // Simple calculation without taxes/fees for now

    return {
      items,
      subtotal,
      discounts: [],
      taxes: [],
      fees: [],
      deliveryFee: 0,
      tip: 0,
      total,
      hash: ''
    };
  }, [items, summary]);

  return {
    items,
    summary: cartSummary,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    isEmpty: items.length === 0,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
}