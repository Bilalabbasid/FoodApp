import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { api } from '../utils/api';

export const useCart = () => {
  const {
    items,
    storeId,
    deliveryMethod,
    deliveryZoneId,
    couponCode,
    tip,
    summary,
    setSummary
  } = useCartStore();

  // Calculate pricing when cart changes
  useEffect(() => {
    const calculatePricing = async () => {
      if (items.length === 0 || !storeId) {
        setSummary(undefined);
        return;
      }

      try {
        const response = await api.calculateCartPricing({
          items: items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant?.id,
            selectedAddons: item.selectedAddons.map(a => a.id)
          })),
          storeId,
          deliveryMethod,
          deliveryZoneId,
          couponCode,
          zipCode: '10001'
        });

        if (response.success) {
          const updatedSummary = { 
            ...response.data, 
            tip,
            total: response.data.total + tip
          };
          setSummary(updatedSummary);
        }
      } catch (error) {
        console.error('Failed to calculate pricing:', error);
        setSummary(undefined);
      }
    };

    const timeoutId = setTimeout(calculatePricing, 300);
    return () => clearTimeout(timeoutId);
  }, [items, storeId, deliveryMethod, deliveryZoneId, couponCode, tip, setSummary]);

  return {
    items,
    summary,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    isEmpty: items.length === 0
  };
};