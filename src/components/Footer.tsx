import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              <span className="text-orange-500">Tasty</span>Crave
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Delivering delicious, fresh meals to your doorstep. Made with love, served with care.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mt-0.5 mr-3 text-orange-500 flex-shrink-0" />
                <span className="text-gray-400">
                  456 Broadway<br />
                  New York, NY 10013
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-orange-500" />
                <span className="text-gray-400">+1-555-123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-orange-500" />
                <span className="text-gray-400">orders@tastycrave.com</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Hours</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Mon - Thu</span>
                <span>11:00 AM - 11:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Fri - Sat</span>
                <span>11:00 AM - 12:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>11:00 AM - 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/menu" className="block text-gray-400 hover:text-orange-500 transition-colors">
                Our Menu
              </Link>
              <Link to="/about" className="block text-gray-400 hover:text-orange-500 transition-colors">
                About Us
              </Link>
              <Link to="/catering" className="block text-gray-400 hover:text-orange-500 transition-colors">
                Catering
              </Link>
              <Link to="/gift-cards" className="block text-gray-400 hover:text-orange-500 transition-colors">
                Gift Cards
              </Link>
              <Link to="/privacy-policy" className="block text-gray-400 hover:text-orange-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="block text-gray-400 hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; 2025 TastyCrave. All rights reserved. Made with ❤️ in NYC.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;