import React, { useState, useEffect } from 'react';
import { Save, Settings, Store, Mail, Phone, MapPin, Clock, DollarSign, CreditCard, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../utils/api';

interface StoreSettings {
  _id: string;
  name: string;
  slug: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  hours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
  isOpen: boolean;
  prepTimeMins: number;
  deliveryZones: Array<{
    name: string;
    fee: number;
    minOrder: number;
    radius: number;
    center: {
      lat: number;
      lng: number;
    };
  }>;
  paymentConfig: {
    stripeEnabled: boolean;
    cashEnabled: boolean;
    minOrderForDelivery: number;
    maxOrderValue: number;
  };
}

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      setLoading(true);
      const response = await api.stores.getBySlug('downtown');
      setStoreSettings(response.data);
    } catch (error) {
      console.error('Error fetching store settings:', error);
      toast.error('Failed to load store settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!storeSettings) return;

    try {
      setSaving(true);
      await api.stores.update(storeSettings._id, storeSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateStoreSettings = (field: string, value: any) => {
    if (!storeSettings) return;
    setStoreSettings({
      ...storeSettings,
      [field]: value
    });
  };

  const updateNestedSettings = (parent: string, field: string, value: any) => {
    if (!storeSettings) return;
    setStoreSettings({
      ...storeSettings,
      [parent]: {
        ...(storeSettings as any)[parent],
        [field]: value
      }
    });
  };

  const updateHours = (dayIndex: number, field: string, value: any) => {
    if (!storeSettings) return;
    const newHours = [...storeSettings.hours];
    newHours[dayIndex] = {
      ...newHours[dayIndex],
      [field]: value
    };
    setStoreSettings({
      ...storeSettings,
      hours: newHours
    });
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Store },
    { id: 'hours', name: 'Hours', icon: Clock },
    { id: 'delivery', name: 'Delivery', icon: MapPin },
    { id: 'payments', name: 'Payments', icon: CreditCard },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!storeSettings) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load store settings</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Store Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your store configuration and preferences</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeSettings.name}
                    onChange={(e) => updateStoreSettings('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={storeSettings.slug}
                    onChange={(e) => updateStoreSettings('slug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => updateStoreSettings('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={storeSettings.phone}
                    onChange={(e) => updateStoreSettings('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Address
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={storeSettings.address.street}
                        onChange={(e) => updateNestedSettings('address', 'street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        value={storeSettings.address.city}
                        onChange={(e) => updateNestedSettings('address', 'city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State"
                        value={storeSettings.address.state}
                        onChange={(e) => updateNestedSettings('address', 'state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={storeSettings.prepTimeMins}
                    onChange={(e) => updateStoreSettings('prepTimeMins', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storeSettings.isOpen}
                      onChange={(e) => updateStoreSettings('isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Store is Open</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
              <div className="space-y-4">
                {storeSettings.hours.map((hour, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <span className="font-medium text-gray-700">{dayNames[hour.dayOfWeek]}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!hour.isClosed}
                        onChange={(e) => updateHours(index, 'isClosed', !e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600">Open</span>
                    </div>
                    {!hour.isClosed && (
                      <>
                        <input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) => updateHours(index, 'openTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) => updateHours(index, 'closeTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </>
                    )}
                    {hour.isClosed && (
                      <span className="text-gray-500 italic">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storeSettings.paymentConfig.stripeEnabled}
                      onChange={(e) => updateNestedSettings('paymentConfig', 'stripeEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Enable Credit Card Payments (Stripe)</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storeSettings.paymentConfig.cashEnabled}
                      onChange={(e) => updateNestedSettings('paymentConfig', 'cashEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Enable Cash Payments</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Minimum Order for Delivery
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={storeSettings.paymentConfig.minOrderForDelivery}
                    onChange={(e) => updateNestedSettings('paymentConfig', 'minOrderForDelivery', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Maximum Order Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={storeSettings.paymentConfig.maxOrderValue}
                    onChange={(e) => updateNestedSettings('paymentConfig', 'maxOrderValue', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
