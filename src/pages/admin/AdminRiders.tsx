import React, { useState, useEffect } from 'react';
import { Users, MapPin, Clock, Star, TrendingUp, Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Rider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  vehicleType: 'bike' | 'scooter' | 'car';
  isOnline: boolean;
  lastActive: Date;
  currentOrder?: string;
}

interface Assignment {
  _id: string;
  orderId: string;
  orderNo: string;
  riderId: string;
  riderName: string;
  customerAddress: string;
  distance: number;
  estimatedTime: number;
  assignedAt: Date;
  status: 'assigned' | 'picked_up' | 'delivered';
  earnings: number;
}

const AdminRiders: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<'riders' | 'assignments' | 'analytics'>('riders');

  // Mock data for demonstration
  useEffect(() => {
    const mockRiders: Rider[] = [
      {
        _id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'available',
        currentLocation: {
          lat: 40.7128,
          lng: -74.0060,
          address: '5th Avenue, NYC'
        },
        rating: 4.8,
        totalDeliveries: 234,
        totalEarnings: 2840,
        vehicleType: 'bike',
        isOnline: true,
        lastActive: new Date(),
      },
      {
        _id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1234567891',
        status: 'busy',
        currentLocation: {
          lat: 40.7589,
          lng: -73.9851,
          address: 'Central Park, NYC'
        },
        rating: 4.9,
        totalDeliveries: 189,
        totalEarnings: 2156,
        vehicleType: 'scooter',
        isOnline: true,
        lastActive: new Date(),
        currentOrder: 'ORD-000123'
      },
      {
        _id: '3',
        name: 'Mike Davis',
        email: 'mike@example.com',
        phone: '+1234567892',
        status: 'offline',
        rating: 4.6,
        totalDeliveries: 98,
        totalEarnings: 1204,
        vehicleType: 'car',
        isOnline: false,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      }
    ];

    const mockAssignments: Assignment[] = [
      {
        _id: '1',
        orderId: 'order1',
        orderNo: 'ORD-000123',
        riderId: '2',
        riderName: 'Sarah Johnson',
        customerAddress: '123 Broadway, NYC',
        distance: 2.3,
        estimatedTime: 15,
        assignedAt: new Date(Date.now() - 10 * 60 * 1000),
        status: 'picked_up',
        earnings: 12.50
      },
      {
        _id: '2',
        orderId: 'order2',
        orderNo: 'ORD-000124',
        riderId: '1',
        riderName: 'John Smith',
        customerAddress: '456 Madison Ave, NYC',
        distance: 1.8,
        estimatedTime: 12,
        assignedAt: new Date(Date.now() - 5 * 60 * 1000),
        status: 'assigned',
        earnings: 10.00
      }
    ];

    setRiders(mockRiders);
    setAssignments(mockAssignments);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-orange-100 text-orange-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bike':
        return '🚲';
      case 'scooter':
        return '🛵';
      case 'car':
        return '🚗';
      default:
        return '🚲';
    }
  };

  const handleAssignOrder = (riderId: string, orderNo: string) => {
    // In real implementation, this would call the API
    console.log(`Assigning order ${orderNo} to rider ${riderId}`);
  };

  const handleStatusUpdate = (riderId: string, newStatus: 'available' | 'busy' | 'offline') => {
    setRiders(riders.map(rider => 
      rider._id === riderId ? { ...rider, status: newStatus } : rider
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rider Management</h1>
          <p className="text-gray-600">Manage delivery riders and assignments</p>
        </div>
        
        <button
          onClick={() => console.log('Add rider')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Rider
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'riders', name: 'Riders', icon: Users },
            { id: 'assignments', name: 'Active Assignments', icon: MapPin },
            { id: 'analytics', name: 'Analytics', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'riders' | 'assignments' | 'analytics')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Riders Tab */}
      {activeTab === 'riders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {riders.map((rider) => (
              <motion.div
                key={rider._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{getVehicleIcon(rider.vehicleType)}</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{rider.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rider.status)}`}>
                        {rider.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {rider.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {rider.email}
                  </div>
                  {rider.currentLocation && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {rider.currentLocation.address}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="font-medium">{rider.rating}</span>
                  </div>
                  <span className="text-gray-600">{rider.totalDeliveries} deliveries</span>
                </div>

                <div className="flex space-x-2">
                  {rider.status === 'available' && (
                    <button
                      onClick={() => handleAssignOrder(rider._id, 'ORD-000125')}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Assign Order
                    </button>
                  )}
                  
                  {rider.status === 'offline' && (
                    <button
                      onClick={() => handleStatusUpdate(rider._id, 'available')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      Set Available
                    </button>
                  )}
                  
                  {rider.status !== 'offline' && (
                    <button
                      onClick={() => handleStatusUpdate(rider._id, 'offline')}
                      className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                    >
                      Set Offline
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Assignments</h2>
            
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {assignment.orderNo}
                      </span>
                      <span className="ml-3 font-medium text-gray-900">
                        {assignment.riderName}
                      </span>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'assigned' ? 'bg-orange-100 text-orange-800' :
                      assignment.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Customer Address:</span>
                      <p className="font-medium">{assignment.customerAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Distance:</span>
                      <p className="font-medium">{assignment.distance} km</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Est. Time:</span>
                      <p className="font-medium">{assignment.estimatedTime} min</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Earnings:</span>
                      <p className="font-medium">${assignment.earnings}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Riders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riders.filter(r => r.status !== 'offline').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg. Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">18 min</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">$6,200</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRiders;
