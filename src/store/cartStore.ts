import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  itemId: string;
  name: string;
  quantity: number;
  selectedVariant?: {
    id: string;
    name: string;
    priceDelta: number;
  };
  selectedAddons: {
    id: string;
    name: string;
    priceDelta: number;
  }[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discounts: { type: string; name: string; amount: number; code?: string }[];
  taxes: { name: string; rate: number; amount: number }[];
  fees: { name: string; type: string; amount: number }[];
  deliveryFee: number;
  tip: number;
  total: number;
  hash: string;
}

interface CartStore {
  items: CartItem[];
  storeId?: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryZoneId?: string;
  couponCode?: string;
  tip: number;
  summary?: CartSummary;
  
  // Actions
  addItem: (item: CartItem, storeId: string) => void;
  removeItem: (itemId: string, variantId?: string, addonIds?: string[]) => void;
  updateQuantity: (itemId: string, quantity: number, variantId?: string, addonIds?: string[]) => void;
  clearCart: () => void;
  setDeliveryMethod: (method: 'pickup' | 'delivery') => void;
  setDeliveryZone: (zoneId: string) => void;
  setCouponCode: (code: string) => void;
  setTip: (tip: number) => void;
  setSummary: (summary: CartSummary) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryMethod: 'pickup',
      tip: 0,

      addItem: (item: CartItem, storeId: string) => {
        const { items, storeId: currentStoreId } = get();
        
        // Clear cart if switching stores
        if (currentStoreId && currentStoreId !== storeId) {
          set({
            items: [item],
            storeId,
            summary: undefined
          });
          return;
        }

        // Check if item with same configuration already exists
        const existingItemIndex = items.findIndex(
          cartItem => 
            cartItem.itemId === item.itemId &&
            cartItem.selectedVariant?.id === item.selectedVariant?.id &&
            JSON.stringify(cartItem.selectedAddons.map(a => a.id).sort()) === JSON.stringify(item.selectedAddons.map(a => a.id).sort())
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += item.quantity;
          updatedItems[existingItemIndex].totalPrice = 
            item.unitPrice * updatedItems[existingItemIndex].quantity;

          set({ items: updatedItems, storeId, summary: undefined });
        } else {
          // Add new item
          set({ 
            items: [...items, item], 
            storeId,
            summary: undefined 
          });
        }
      },

      removeItem: (itemId: string, variantId?: string, addonIds?: string[]) => {
        const { items } = get();
        const filteredItems = items.filter(item => {
          if (item.itemId !== itemId) return true;
          
          const variantMatch = !variantId || item.selectedVariant?.id === variantId;
          const addonMatch = !addonIds || 
            JSON.stringify(item.selectedAddons.map(a => a.id).sort()) === JSON.stringify(addonIds.sort());
          
          return !(variantMatch && addonMatch);
        });

        set({ items: filteredItems, summary: undefined });
      },

      updateQuantity: (itemId: string, quantity: number, variantId?: string, addonIds?: string[]) => {
        const { items } = get();
        
        if (quantity <= 0) {
          get().removeItem(itemId, variantId, addonIds);
          return;
        }

        const updatedItems = items.map(item => {
          const variantMatch = !variantId || item.selectedVariant?.id === variantId;
          const addonMatch = !addonIds || 
            JSON.stringify(item.selectedAddons.map(a => a.id).sort()) === JSON.stringify(addonIds.sort());
          
          if (item.itemId === itemId && variantMatch && addonMatch) {
            return {
              ...item,
              quantity,
              totalPrice: item.unitPrice * quantity
            };
          }
          return item;
        });

        set({ items: updatedItems, summary: undefined });
      },

      clearCart: () => {
        set({
          items: [],
          storeId: undefined,
          deliveryMethod: 'pickup',
          deliveryZoneId: undefined,
          couponCode: undefined,
          tip: 0,
          summary: undefined
        });
      },

      setDeliveryMethod: (method: 'pickup' | 'delivery') => {
        set({ deliveryMethod: method, summary: undefined });
      },

      setDeliveryZone: (zoneId: string) => {
        set({ deliveryZoneId: zoneId, summary: undefined });
      },

      setCouponCode: (code: string) => {
        set({ couponCode: code, summary: undefined });
      },

      setTip: (tip: number) => {
        set({ tip, summary: undefined });
      },

      setSummary: (summary: CartSummary) => {
        set({ summary });
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        storeId: state.storeId,
        deliveryMethod: state.deliveryMethod,
        deliveryZoneId: state.deliveryZoneId,
        couponCode: state.couponCode,
        tip: state.tip
      }),
      version: 1
    }
  )
);