import React from 'react';
import { MapPin, Phone, Mail, Clock, Users, Award, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About <span className="text-orange-500">TastyCrave</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're passionate about bringing fresh, delicious meals to your doorstep. 
            Founded in 2020, TastyCrave has been serving the community with quality food and exceptional service.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              TastyCrave started as a small family-owned restaurant with a simple mission: 
              to create delicious, authentic meals using the freshest ingredients available.
            </p>
            <p className="text-gray-600 mb-4">
              What began as a neighborhood favorite has grown into a beloved delivery service, 
              bringing restaurant-quality meals directly to your home or office.
            </p>
            <p className="text-gray-600">
              Today, we're proud to serve thousands of customers across the city, 
              maintaining our commitment to quality, freshness, and exceptional customer service.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Heart className="h-6 w-6 text-orange-500 mt-1 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Made with Love</h4>
                  <p className="text-gray-600 text-sm">Every dish is prepared with care and passion</p>
                </div>
              </div>
              <div className="flex items-start">
                <Award className="h-6 w-6 text-orange-500 mt-1 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Quality Ingredients</h4>
                  <p className="text-gray-600 text-sm">We source only the freshest, highest-quality ingredients</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-orange-500 mt-1 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Fast Delivery</h4>
                  <p className="text-gray-600 text-sm">Quick and reliable delivery to your doorstep</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-orange-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Marco Rodriguez</h3>
              <p className="text-orange-500 font-medium mb-2">Head Chef</p>
              <p className="text-gray-600 text-sm">
                With 15 years of culinary experience, Marco brings authentic flavors and innovative techniques to every dish.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-orange-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Johnson</h3>
              <p className="text-orange-500 font-medium mb-2">Operations Manager</p>
              <p className="text-gray-600 text-sm">
                Sarah ensures every order is perfect and delivered on time with her attention to detail and customer focus.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-orange-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">David Chen</h3>
              <p className="text-orange-500 font-medium mb-2">Customer Service Lead</p>
              <p className="text-gray-600 text-sm">
                David and his team are dedicated to providing exceptional customer service and support.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600">
                456 Broadway<br />
                New York, NY 10013
              </p>
            </div>
            <div className="text-center">
              <Phone className="h-8 w-8 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">+1-555-123-4567</p>
            </div>
            <div className="text-center">
              <Mail className="h-8 w-8 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">hello@tastycrave.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
