import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import MenuItemCard from '../components/MenuItemCard';
import { MenuItemSkeleton, CategorySkeleton } from '../components/Skeleton';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface MenuItem {
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
  variants: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const MenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDietary, setSelectedDietary] = useState(searchParams.get('dietary') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Default store ID (in production, this would come from store selection)
  const DEFAULT_STORE_ID = 'downtown';

  const { data: menuData, isLoading, error } = useQuery({
    queryKey: ['menu', DEFAULT_STORE_ID, selectedCategory, searchTerm, selectedDietary],
    queryFn: () => api.getStoreMenu(DEFAULT_STORE_ID, {
      ...(selectedCategory && { category: selectedCategory }),
      ...(searchTerm && { search: searchTerm }),
      ...(selectedDietary && { dietary: selectedDietary })
    }),
    enabled: !!DEFAULT_STORE_ID,
    retry: 1
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchTerm) params.set('search', searchTerm);
    if (selectedDietary) params.set('dietary', selectedDietary);
    setSearchParams(params);
  }, [selectedCategory, searchTerm, selectedDietary, setSearchParams]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories: Category[] = menuData?.success ? (menuData.data as any)?.categories || [] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: MenuItem[] = menuData?.success ? (menuData.data as any)?.items || [] : [];

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian', icon: Leaf },
    { value: 'vegan', label: 'Vegan', icon: Leaf },
    { value: 'gluten-free', label: 'Gluten-Free', icon: Leaf },
    { value: 'halal', label: 'Halal', icon: Star },
    { value: 'spicy', label: 'Spicy', icon: Star }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Categories skeleton */}
          <div className="mb-8">
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <CategorySkeleton key={index} />
              ))}
            </div>
          </div>

          {/* Search and filters skeleton */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu items skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <MenuItemSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to load menu</h2>
          <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our delicious selection of fresh, made-to-order meals
        </p>
      </motion.div>

      {/* Categories quick nav */}
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Browse by Category</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:border-orange-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category: Category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search and filters */}
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Filter toggle */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          {(selectedCategory || selectedDietary) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedDietary('');
              }}
              className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-6 space-y-6"
          >
            {/* Category filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    !selectedCategory 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                {categories.map((category: Category) => (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Dietary Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDietary(
                      selectedDietary === option.value ? '' : option.value
                    )}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
                      selectedDietary === option.value
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <option.icon className="h-3 w-3 mr-1" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Menu items */}
      <div className="space-y-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item: MenuItem, index: number) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <MenuItemCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
    </div>
  );
};

export default MenuPage;