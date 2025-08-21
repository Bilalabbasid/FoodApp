import React, { useState } from 'react';
import { Clock, Users, MapPin, Phone, Mail, Calendar, ChefHat } from 'lucide-react';

const CateringPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    eventType: '',
    budget: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    alert('Thank you for your catering inquiry! We will contact you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      eventDate: '',
      guestCount: '',
      eventType: '',
      budget: '',
      message: ''
    });
  };

  const cateringPackages = [
    {
      name: 'Bronze Package',
      price: '$15',
      priceUnit: 'per person',
      description: 'Perfect for casual gatherings and meetings',
      features: [
        'Selection of appetizers',
        'Choice of 2 main dishes',
        'Seasonal salad',
        'Disposable plates and utensils',
        'Setup and cleanup'
      ]
    },
    {
      name: 'Silver Package',
      price: '$25',
      priceUnit: 'per person',
      description: 'Ideal for corporate events and celebrations',
      features: [
        'Premium appetizer selection',
        'Choice of 3 main dishes',
        'Two seasonal salads',
        'Dessert platter',
        'Eco-friendly plates and utensils',
        'Professional setup and cleanup',
        'Serving staff (2 hours)'
      ],
      popular: true
    },
    {
      name: 'Gold Package',
      price: '$40',
      priceUnit: 'per person',
      description: 'Ultimate experience for special occasions',
      features: [
        'Gourmet appetizer station',
        'Choice of 4 main dishes',
        'Premium salad bar',
        'Artisanal dessert selection',
        'China plates and real utensils',
        'Full-service staff',
        'Custom menu consultation',
        'Beverages included'
      ]
    }
  ];

  const eventTypes = [
    'Corporate Meeting',
    'Birthday Party',
    'Wedding',
    'Anniversary',
    'Graduation',
    'Holiday Party',
    'Conference',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-orange-500">Catering</span> Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Let us make your next event unforgettable with our delicious catering options. 
            From intimate gatherings to large celebrations, we've got you covered.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <ChefHat className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Chefs</h3>
            <p className="text-gray-600 text-sm">Professional culinary team with years of experience</p>
          </div>
          <div className="text-center">
            <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Any Size Event</h3>
            <p className="text-gray-600 text-sm">From 10 to 500+ guests, we scale to your needs</p>
          </div>
          <div className="text-center">
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">On-Time Service</h3>
            <p className="text-gray-600 text-sm">Reliable delivery and setup when you need it</p>
          </div>
          <div className="text-center">
            <Calendar className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
            <p className="text-gray-600 text-sm">Available 7 days a week with advance booking</p>
          </div>
        </div>

        {/* Packages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Catering Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cateringPackages.map((pkg, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-md p-8 relative ${pkg.popular ? 'ring-2 ring-orange-500' : ''}`}>
                {pkg.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-orange-500 mb-1">
                    {pkg.price}
                    <span className="text-lg text-gray-600 font-normal">/{pkg.priceUnit}</span>
                  </div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  Select Package
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Request a Quote</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                required
                value={formData.eventDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests *
              </label>
              <input
                type="number"
                id="guestCount"
                name="guestCount"
                required
                min="1"
                value={formData.guestCount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                id="eventType"
                name="eventType"
                required
                value={formData.eventType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select budget range</option>
                <option value="under-500">Under $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000-2500">$1,000 - $2,500</option>
                <option value="2500-5000">$2,500 - $5,000</option>
                <option value="over-5000">Over $5,000</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us more about your event, dietary restrictions, special requests, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Submit Quote Request
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-12 bg-gray-100 rounded-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Have Questions?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Phone className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Call Us</p>
              <p className="text-gray-600">+1-555-123-4567</p>
            </div>
            <div>
              <Mail className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Email Us</p>
              <p className="text-gray-600">catering@tastycrave.com</p>
            </div>
            <div>
              <MapPin className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Visit Us</p>
              <p className="text-gray-600">456 Broadway, New York, NY</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CateringPage;
