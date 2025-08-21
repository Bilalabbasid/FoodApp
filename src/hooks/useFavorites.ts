import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const updateFavorites = () => {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(favs);
    };

    updateFavorites();
    
    // Listen for storage changes
    window.addEventListener('storage', updateFavorites);
    
    return () => window.removeEventListener('storage', updateFavorites);
  }, []);

  const addFavorite = (itemId: string) => {
    const newFavorites = [...favorites, itemId];
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const removeFavorite = (itemId: string) => {
    const newFavorites = favorites.filter(id => id !== itemId);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };
}
