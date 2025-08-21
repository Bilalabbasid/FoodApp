import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Plus, Leaf, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useToast } from './Toast';
import { CartItem } from '../store/cartStore';

interface MenuItemCardProps {
  item: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    images: string[];
    tags: string[];
    dietary: string[];
    prepTimeMinutes: number;
    calories?: number;
    variants: Array<{
      name: string;
      priceDelta: number;
    }>;
  };
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem: CartItem = {
      itemId: item._id,
      name: item.name,
      quantity: 1,
      selectedAddons: [],
      unitPrice: item.basePrice,
      totalPrice: item.basePrice,
      image: item.images[0] || '/placeholder-food.jpg'
    };

    addItem(cartItem, 'default-store');
    showToast(`${item.name} added to cart!`, 'success');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    showToast(
      isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite ? 'info' : 'success'
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDietaryIcon = (dietary: string) => {
    switch (dietary) {
      case 'vegetarian':
      case 'vegan':
      case 'gluten-free':
        return <Leaf className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  const getDietaryColor = (dietary: string) => {
    switch (dietary) {
      case 'vegetarian':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'vegan':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'gluten-free':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'halal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'spicy':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const hasVariants = item.variants && item.variants.length > 0;
  const startingPrice = hasVariants 
    ? Math.min(item.basePrice, ...item.variants.map((v) => item.basePrice + v.priceDelta))
    : item.basePrice;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <Link to={`/item/${item.slug}`}>
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={item.images[0] || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
            alt={item.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Favorite Button */}
          <motion.button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
          
          {/* Tags overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Dietary badges */}
          <div className="absolute bottom-20 right-3 flex flex-col gap-1">
            {item.dietary.slice(0, 2).map((diet) => (
              <span
                key={diet}
                className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getDietaryColor(diet)}`}
              >
                {getDietaryIcon(diet)}
                <span className="ml-1 capitalize">{diet}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-1">
              {item.name}
            </h3>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {hasVariants ? `From ${formatPrice(startingPrice)}` : formatPrice(item.basePrice)}
              </div>
              {item.calories && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.calories} cal</div>
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{item.prepTimeMinutes} min</span>
            </div>

            <motion.button 
              onClick={handleQuickAdd}
              className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors group-hover:scale-110 transform duration-200"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MenuItemCard;