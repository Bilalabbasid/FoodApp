import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../utils/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: {
    _id: string;
    name: string;
  };
  images: string[];
  tags: string[];
  dietary: string[];
  isAvailable: boolean;
  variants: Array<{
    name: string;
    priceDelta: number;
    isDefault: boolean;
  }>;
  addonGroups: Array<{
    name: string;
    min: number;
    max: number;
    isRequired: boolean;
    addons: Array<{
      name: string;
      priceDelta: number;
      isAvailable: boolean;
    }>;
  }>;
  prepTimeMinutes: number;
}

interface EditForm {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  tags: string[];
  dietary: string[];
  isAvailable: boolean;
  prepTimeMinutes: number;
}

const AdminMenu: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    description: '',
    basePrice: 0,
    categoryId: '',
    images: [],
    tags: [],
    dietary: [],
    isAvailable: true,
    prepTimeMinutes: 15
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, itemsRes] = await Promise.all([
        api.get('/stores/downtown/categories'),
        api.get('/stores/downtown/items')
      ]);
      
      setCategories(categoriesRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      toast.error('Failed to load menu data');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/items/${itemId}`, {
        isAvailable: !currentStatus
      });
      
      setItems(items.map(item => 
        item._id === itemId 
          ? { ...item, isAvailable: !currentStatus }
          : item
      ));
      
      toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to update item availability:', error);
      toast.error('Failed to update item availability');
    }
  };

  const startEditing = (item: MenuItem) => {
    setEditingItem(item._id);
    setEditForm({
      name: item.name,
      description: item.description,
      basePrice: item.basePrice,
      categoryId: item.categoryId._id,
      images: item.images,
      tags: item.tags,
      dietary: item.dietary,
      isAvailable: item.isAvailable,
      prepTimeMinutes: item.prepTimeMinutes
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm({
      name: '',
      description: '',
      basePrice: 0,
      categoryId: '',
      images: [],
      tags: [],
      dietary: [],
      isAvailable: true,
      prepTimeMinutes: 15
    });
  };

  const saveItem = async (itemId?: string) => {
    try {
      if (itemId) {
        // Update existing item
        await api.patch(`/admin/items/${itemId}`, editForm);
        setItems(items.map(item => 
          item._id === itemId 
            ? { 
                ...item, 
                ...editForm, 
                categoryId: categories.find(c => c._id === editForm.categoryId) || item.categoryId
              }
            : item
        ));
        toast.success('Item updated successfully');
        setEditingItem(null);
      } else {
        // Create new item
        const response = await api.post('/admin/items', {
          ...editForm,
          storeId: 'downtown' // Use actual store ID
        });
        setItems([...items, response.data]);
        toast.success('Item created successfully');
        setShowAddForm(false);
      }
      
      cancelEditing();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save item';
      toast.error(errorMessage);
      console.error('Save item error:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.delete(`/admin/items/${itemId}`);
      setItems(items.filter(item => item._id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Delete item error:', error);
      toast.error('Failed to delete item');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFormChange = (field: string, value: string | number | boolean | string[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setEditForm(prev => ({ ...prev, tags }));
  };

  const ItemForm = ({ onSave, onCancel }: { 
    onSave: () => void; 
    onCancel: () => void; 
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Item name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={editForm.basePrice}
            onChange={(e) => handleFormChange('basePrice', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={editForm.categoryId}
            onChange={(e) => handleFormChange('categoryId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (minutes)</label>
          <input
            type="number"
            value={editForm.prepTimeMinutes}
            onChange={(e) => handleFormChange('prepTimeMinutes', parseInt(e.target.value) || 15)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="15"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={editForm.description}
          onChange={(e) => handleFormChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Item description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
        <input
          type="text"
          value={editForm.tags.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="spicy, popular, vegetarian"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
        <input
          type="url"
          value={editForm.images[0] || ''}
          onChange={(e) => handleFormChange('images', [e.target.value])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={editForm.isAvailable}
            onChange={(e) => handleFormChange('isAvailable', e.target.checked)}
            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <span className="ml-2 text-sm text-gray-700">Available</span>
        </label>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="h-4 w-4 mr-2 inline" />
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Save className="h-4 w-4 mr-2 inline" />
          Save
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant's menu items and categories</p>
          </div>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </motion.div>

        {/* Add Item Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ItemForm
                onSave={() => saveItem()}
                onCancel={() => {
                  setShowAddForm(false);
                  cancelEditing();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Menu items grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {editingItem === item._id ? (
                <ItemForm
                  onSave={() => saveItem(item._id)}
                  onCancel={cancelEditing}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4">
                      <img
                        src={item.images[0] || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.categoryId.name}</p>
                        </div>
                        <span className="text-xl font-bold text-orange-500">
                          {formatPrice(item.basePrice)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleAvailability(item._id, item.isAvailable)}
                            className={`p-2 rounded-lg ${
                              item.isAvailable 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-red-600 hover:bg-red-50'
                            } transition-colors`}
                          >
                            {item.isAvailable ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => startEditing(item)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => deleteItem(item._id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {filteredItems.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </button>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;