import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Truck, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const featuredCategories = [
    {
      name: 'Pizza',
      image: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg',
      description: 'Hand-tossed with fresh ingredients'
    },
    {
      name: 'Burgers',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
      description: 'Gourmet burgers made fresh daily'
    },
    {
      name: 'Salads',
      image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg',
      description: 'Fresh, healthy, and delicious'
    }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Average delivery time of 25-35 minutes'
    },
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'Free delivery on orders over $30'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Fresh ingredients, made to order'
    }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg')"
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Delicious Food
              <br />
              <span className="text-orange-400">Delivered Fresh</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Experience the finest flavors delivered straight to your door. 
              Made with love, served with care.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                to="/menu"
                className="inline-flex items-center group bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Order Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-200">4.9/5 from 2,400+ reviews</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose TastyCrave?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best food delivery experience in the city
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6 group-hover:bg-orange-200 transition-colors">
                <feature.icon className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Specialties</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular categories, crafted with the finest ingredients
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <Link to={`/menu?category=${category.name.toLowerCase()}`}>
                <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-gray-200">{category.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/menu"
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            View Full Menu
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Order?</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust TastyCrave for their food delivery needs
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-500 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Ordering
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;