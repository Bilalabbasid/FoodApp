import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { useKitchen } from '../hooks/useKitchen';
import { useRider } from '../hooks/useRider';
import { useUser } from '../hooks/useUser';
import LoadingSpinner from './LoadingSpinner';

interface DashboardProps {
  userRole?: 'customer' | 'staff' | 'manager' | 'admin' | 'rider';
}

const RoleDashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use role-specific hooks based on user role
  const adminData = useAdmin();
  const kitchenData = useKitchen();
  const riderData = useRider();
  const userData = useUser();

  const currentRole = userRole || user?.roles?.[0] || 'customer';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to continue</h2>
          <p className="text-gray-600">You need to be authenticated to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (currentRole === 'admin' && adminData.hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>
              <button
                onClick={() => logout()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'stores', 'riders', 'financials', 'system'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {adminData.loading && <LoadingSpinner />}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminData.metrics && (
                  <>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                      <p className="text-3xl font-bold text-green-600">
                        ${adminData.metrics.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {adminData.metrics.revenueGrowth > 0 ? '+' : ''}
                        {adminData.metrics.revenueGrowth.toFixed(1)}% vs last month
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
                      <p className="text-3xl font-bold text-blue-600">
                        {adminData.metrics.totalOrders.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {adminData.metrics.orderGrowth > 0 ? '+' : ''}
                        {adminData.metrics.orderGrowth.toFixed(1)}% vs last month
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-medium text-gray-900">Active Customers</h3>
                      <p className="text-3xl font-bold text-purple-600">
                        {adminData.metrics.activeCustomers.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {adminData.metrics.newCustomersToday} new today
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-medium text-gray-900">Avg Order Value</h3>
                      <p className="text-3xl font-bold text-orange-600">
                        ${adminData.metrics.avgOrderValue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {adminData.metrics.conversionRate.toFixed(1)}% conversion rate
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Pending Approvals */}
              {adminData.pendingApprovals && adminData.totalPendingApprovals > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-yellow-800 mb-4">
                    Pending Approvals ({adminData.totalPendingApprovals})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {adminData.pendingApprovals.stores.length > 0 && (
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium">Stores ({adminData.pendingApprovals.stores.length})</h4>
                        <ul className="mt-2 space-y-1">
                          {adminData.pendingApprovals.stores.slice(0, 3).map((store) => (
                            <li key={store._id} className="text-sm text-gray-600">
                              {store.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {adminData.pendingApprovals.riders.length > 0 && (
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium">Riders ({adminData.pendingApprovals.riders.length})</h4>
                        <ul className="mt-2 space-y-1">
                          {adminData.pendingApprovals.riders.slice(0, 3).map((rider) => (
                            <li key={rider._id} className="text-sm text-gray-600">
                              {rider.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {adminData.pendingApprovals.withdrawals.length > 0 && (
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium">Withdrawals ({adminData.pendingApprovals.withdrawals.length})</h4>
                        <ul className="mt-2 space-y-1">
                          {adminData.pendingApprovals.withdrawals.slice(0, 3).map((withdrawal) => (
                            <li key={withdrawal._id} className="text-sm text-gray-600">
                              ${withdrawal.amount} - {withdrawal.user.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Health */}
              {adminData.systemHealth && (
                <div className={`rounded-lg p-6 ${
                  adminData.isSystemHealthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-4 ${
                    adminData.isSystemHealthy ? 'text-green-800' : 'text-red-800'
                  }`}>
                    System Health {adminData.isSystemHealthy ? '✓' : '⚠'}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">CPU Usage</p>
                      <p className={`text-2xl font-bold ${
                        adminData.systemHealth.cpuUsage > 80 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {adminData.systemHealth.cpuUsage.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Memory Usage</p>
                      <p className={`text-2xl font-bold ${
                        adminData.systemHealth.memoryUsage > 80 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {adminData.systemHealth.memoryUsage.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className={`text-2xl font-bold ${
                        adminData.systemHealth.responseTime > 2000 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {adminData.systemHealth.responseTime}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Error Rate</p>
                      <p className={`text-2xl font-bold ${
                        adminData.systemHealth.errorRate > 5 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {adminData.systemHealth.errorRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {adminData.criticalAlerts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-red-800 mb-2">Critical Alerts:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {adminData.criticalAlerts.map((alert, index) => (
                          <li key={index} className="text-red-700">{alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab === 'stores' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Store Management</h3>
              <p className="text-gray-600">Store management interface would be implemented here.</p>
            </div>
          )}

          {activeTab === 'riders' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Rider Management</h3>
              <p className="text-gray-600">Rider management interface would be implemented here.</p>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Financial Reports</h3>
              <p className="text-gray-600">Financial reporting interface would be implemented here.</p>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">System Settings</h3>
              <p className="text-gray-600">System configuration interface would be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Kitchen Dashboard
  if (['staff', 'manager'].includes(currentRole) && kitchenData.hasKitchenAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kitchen Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>
              <button
                onClick={() => logout()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {kitchenData.loading && <LoadingSpinner />}

          {/* Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-yellow-100 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800">Pending Orders</h3>
              <p className="text-3xl font-bold text-yellow-900">{kitchenData.pendingOrders.length}</p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Preparing</h3>
              <p className="text-3xl font-bold text-blue-900">{kitchenData.preparingOrders.length}</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-green-800">Ready</h3>
              <p className="text-3xl font-bold text-green-900">{kitchenData.readyOrders.length}</p>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Active Orders</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {kitchenData.orders.map((order) => (
                <div key={order._id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium">Order #{order.orderNo}</h4>
                      <p className="text-sm text-gray-500">
                        {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} • 
                        Priority: {order.priority}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        {item.specialInstructions && (
                          <span className="text-sm text-gray-500">Note: {item.specialInstructions}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="bg-yellow-50 p-3 rounded mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Special Instructions:</strong> {order.specialInstructions}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => kitchenData.updateOrderStatus(order._id, 'preparing')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => kitchenData.updateOrderStatus(order._id, 'ready')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {kitchenData.orders.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No active orders at the moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rider Dashboard
  if (currentRole === 'rider' && riderData.hasRiderAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>
              <div className="flex space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  riderData.isOnDuty ? 'bg-green-100 text-green-800' :
                  riderData.isOnBreak ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {riderData.isOnDuty ? 'On Duty' : riderData.isOnBreak ? 'On Break' : 'Off Duty'}
                </span>
                <button
                  onClick={() => logout()}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {riderData.loading && <LoadingSpinner />}

          {/* Current Order */}
          {riderData.currentOrder && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Current Delivery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-800">Order #{riderData.currentOrder.orderNo}</h4>
                  <p className="text-blue-700">Status: {riderData.currentOrder.status}</p>
                  <p className="text-blue-700">Total: ${riderData.currentOrder.totalAmount}</p>
                  <p className="text-blue-700">Distance: {riderData.currentOrder.distance}km</p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Customer</h4>
                  <p className="text-blue-700">{riderData.currentOrder.customer.name}</p>
                  <p className="text-blue-700">{riderData.currentOrder.customer.phone}</p>
                  <p className="text-blue-700">{riderData.currentOrder.customer.address}</p>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                {riderData.currentOrder.status === 'assigned' && (
                  <button
                    onClick={() => riderData.updateOrderStatus(riderData.currentOrder!._id, 'picked_up')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Mark Picked Up
                  </button>
                )}
                {riderData.currentOrder.status === 'picked_up' && (
                  <button
                    onClick={() => riderData.updateOrderStatus(riderData.currentOrder!._id, 'en_route')}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    Start Delivery
                  </button>
                )}
                {riderData.currentOrder.status === 'en_route' && (
                  <button
                    onClick={() => riderData.updateOrderStatus(riderData.currentOrder!._id, 'delivered')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Mark Delivered
                  </button>
                )}
                <button
                  onClick={() => riderData.getNavigation('customer')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Get Directions
                </button>
              </div>
            </div>
          )}

          {/* Metrics */}
          {riderData.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Today's Deliveries</h3>
                <p className="text-3xl font-bold text-blue-600">{riderData.metrics.todayDeliveries}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Weekly Earnings</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${riderData.metrics.weeklyEarnings.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {riderData.metrics.averageRating.toFixed(1)} ⭐
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">On-Time Rate</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {riderData.metrics.onTimeDeliveryRate.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Available Orders */}
          {riderData.canAcceptOrders && riderData.availableOrders.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Available Orders</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {riderData.availableOrders.map((order) => (
                  <div key={order._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium">Order #{order.orderNo}</h4>
                        <p className="text-sm text-gray-500">
                          ${order.totalAmount} • {order.distance}km • 
                          Estimated: ${order.riderEarnings.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{order.customer.address}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => riderData.acceptOrder(order._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => riderData.declineOrder(order._id, 'Not available')}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shift Controls */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shift Management</h3>
            <div className="flex space-x-4">
              {!riderData.currentShift && (
                <button
                  onClick={() => riderData.shiftActions.start({ lat: 0, lng: 0 })}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Start Shift
                </button>
              )}
              {riderData.isOnDuty && (
                <button
                  onClick={() => riderData.shiftActions.takeBreak(15)}
                  className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700"
                >
                  Take Break
                </button>
              )}
              {riderData.isOnBreak && (
                <button
                  onClick={() => riderData.shiftActions.resumeWork()}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Resume Work
                </button>
              )}
              {riderData.currentShift && (
                <button
                  onClick={() => riderData.shiftActions.end({ lat: 0, lng: 0 })}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  End Shift
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer Dashboard (default)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={() => logout()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userData.loading && <LoadingSpinner />}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Browse Restaurants</h3>
            <p className="text-gray-600">Discover new restaurants and cuisines in your area</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Track Your Order</h3>
            <p className="text-gray-600">See real-time updates on your current orders</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order History</h3>
            <p className="text-gray-600">View and reorder from your past purchases</p>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Profile Information</h4>
              <p className="text-gray-600">Name: {user.name}</p>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-gray-600">Phone: {user.phone || 'Not provided'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Quick Stats</h4>
              <p className="text-gray-600">Total Orders: Loading...</p>
              <p className="text-gray-600">Favorite Restaurants: Loading...</p>
              <p className="text-gray-600">Member Since: {new Date(user.createdAt || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboard;
