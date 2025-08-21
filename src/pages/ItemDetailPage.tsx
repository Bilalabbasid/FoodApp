import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Minus, ShoppingCart, Clock, Star, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, handleApiError, handleApiSuccess } from '../utils/api';
import { useCartStore } from '../store/cartStore';
import LoadingSpinner from '../components/LoadingSpinner';

const ItemDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  // Default store ID (in production, this would come from store selection)
  const DEFAULT_STORE_ID = 'downtown';

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const { data: itemData, isLoading, error } = useQuery({
    queryKey: ['item', DEFAULT_STORE_ID, slug],
    queryFn: () => api.getItem(DEFAULT_STORE_ID, slug!),
    enabled: !!slug,
    retry: 1
  });

  const item = itemData?.success ? itemData.data : null;

  // Set default variant when item loads
  React.useEffect(() => {
    if (item?.variants?.length > 0 && !selectedVariant) {
      const defaultVariant = item.variants.find((v: any) => v.isDefault) || item.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [item, selectedVariant]);

  const handleAddonToggle = (groupId: string, addonId: string) => {
    const group = item.addonGroups.find((g: any) => g._id === groupId);
    if (!group) return;

    const currentAddons = selectedAddons[groupId] || [];
    
    if (currentAddons.includes(addonId)) {
      // Remove addon
      setSelectedAddons({
        ...selectedAddons,
        [groupId]: currentAddons.filter(id => id !== addonId)
      });
    } else {
      // Add addon (check max limit)
      if (currentAddons.length < group.max) {
        setSelectedAddons({
          ...selectedAddons,
          [groupId]: [...currentAddons, addonId]
        });
      }
    }
  };

  const calculateTotalPrice = () => {
    if (!item) return 0;

    let price = item.basePrice;

    // Add variant price delta
    if (selectedVariant) {
      price += selectedVariant.priceDelta;
    }

    // Add addon prices
    Object.entries(selectedAddons).forEach(([groupId, addonIds]) => {
      const group = item.addonGroups.find((g: any) => g._id === groupId);
      if (group) {
        addonIds.forEach(addonId => {
          const addon = group.addons.find((a: any) => a._id === addonId);
          if (addon) {
            price += addon.priceDelta;
          }
        });
      }
    });

    return price * quantity;
  };

  const handleAddToCart = () => {
    if (!item) return;

    // Validate required addon groups
    const missingRequiredGroups = item.addonGroups.filter((group: any) => 
      group.isRequired && (!selectedAddons[group._id] || selectedAddons[group._id].length < group.min)
    );

    if (missingRequiredGroups.length > 0) {
      handleApiError(new Error(`Please select required options: ${missingRequiredGroups.map((g: any) => g.name).join(', ')}`));
      return;
    }

    const unitPrice = calculateTotalPrice() / quantity;
    const allSelectedAddons = Object.entries(selectedAddons)
      .flatMap(([groupId, addonIds]) => {
        const group = item.addonGroups.find((g: any) => g._id === groupId);
        return addonIds.map(addonId => {
          const addon = group?.addons.find((a: any) => a._id === addonId);
          return {
            id: addonId,
            name: addon?.name || '',
            priceDelta: addon?.priceDelta || 0
          };
        });
      });

    const cartItem = {
      itemId: item._id,
      name: item.name,
      quantity,
      selectedVariant: selectedVariant ? {
        id: selectedVariant._id,
        name: selectedVariant.name,
        priceDelta: selectedVariant.priceDelta
      } : undefined,
      selectedAddons: allSelectedAddons,
      specialInstructions: specialInstructions || undefined,
      unitPrice,
      totalPrice: calculateTotalPrice(),
      image: item.images[0]
    };

    addItem(cartItem, DEFAULT_STORE_ID);
    handleApiSuccess(`${item.name} added to cart!`);
    navigate('/menu');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or is unavailable</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/menu')}
        className="flex items-center text-gray-600 hover:text-orange-500 transition-colors mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Menu
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={item.images[0] || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
              alt={item.name}
              className="w-full h-96 object-cover"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {item.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {item.dietary.length > 0 && (
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {item.dietary.slice(0, 3).map((diet) => (
                  <span
                    key={diet}
                    className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${
                      diet === 'vegetarian' || diet === 'vegan' || diet === 'gluten-free'
                        ? 'bg-green-100 text-green-800'
                        : diet === 'halal'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    {diet}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{item.name}</h1>
            <p className="text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          {/* Meta info */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{item.prepTimeMinutes} min</span>
            </div>
            {item.calories && (
              <div>{item.calories} calories</div>
            )}
          </div>

          {/* Variants */}
          {item.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Size</h3>
              <div className="grid grid-cols-1 gap-2">
                {item.variants.map((variant: any) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedVariant?._id === variant._id
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{variant.name}</span>
                      <span className="text-sm text-gray-600">
                        {variant.priceDelta > 0 && '+'}
                        {formatPrice(item.basePrice + variant.priceDelta)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addon groups */}
          {item.addonGroups.map((group: any) => (
            <div key={group._id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.name}
                  {group.isRequired && <span className="text-red-500 ml-1">*</span>}
                </h3>
                <span className="text-sm text-gray-500">
                  {group.min === group.max 
                    ? `Choose ${group.max}`
                    : `Choose ${group.min}-${group.max}`
                  }
                </span>
              </div>

              <div className="space-y-2">
                {group.addons.map((addon: any) => {
                  const isSelected = selectedAddons[group._id]?.includes(addon._id);
                  const currentCount = selectedAddons[group._id]?.length || 0;
                  const canSelect = currentCount < group.max;
                  const isDisabled = !addon.isAvailable || (!isSelected && !canSelect);

                  return (
                    <button
                      key={addon._id}
                      onClick={() => handleAddonToggle(group._id, addon._id)}
                      disabled={isDisabled}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-900'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{addon.name}</span>
                        <span className="text-sm text-gray-600">
                          {addon.priceDelta > 0 && `+${formatPrice(addon.priceDelta)}`}
                          {addon.priceDelta === 0 && 'Free'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special instructions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Special Instructions</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests or allergies?"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-gray-900">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(calculateTotalPrice())}
                </div>
                <div className="text-sm text-gray-500">
                  {formatPrice(calculateTotalPrice() / quantity)} each
                </div>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className="w-full bg-orange-500 text-white py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart - {formatPrice(calculateTotalPrice())}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ItemDetailPage;