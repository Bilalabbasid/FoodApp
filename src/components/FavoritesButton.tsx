import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './Toast';

interface FavoritesButtonProps {
  itemId: string;
  itemName: string;
  className?: string;
  size?: number;
}

export default function FavoritesButton({ 
  itemId, 
  itemName, 
  className = '', 
  size = 16 
}: FavoritesButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(itemId));
  }, [itemId]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== itemId);
      showToast('Removed from favorites', 'info');
    } else {
      newFavorites = [...favorites, itemId];
      showToast(`${itemName} added to favorites`, 'success');
    }

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.button
      onClick={toggleFavorite}
      className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
        isFavorite 
          ? 'bg-red-500 text-white' 
          : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
      } ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart size={size} fill={isFavorite ? 'currentColor' : 'none'} />
    </motion.button>
  );
}
