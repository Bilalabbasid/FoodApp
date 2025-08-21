import React from 'react';
import { FileText, Scale, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  const lastUpdated = 'December 15, 2024';

  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      content: [
        'By accessing and using TastyCrave\'s services, you accept and agree to be bound by these Terms of Service.',
        'If you do not agree to these terms, you may not use our services.',
        'These terms apply to all users of the service, including customers, restaurant partners, and delivery personnel.',
        'You must be at least 18 years old to use our services or have parental consent.'
      ]
    },
    {
      title: 'Service Description',
      icon: FileText,
      content: [
        'TastyCrave provides an online platform for ordering food from participating restaurants.',
        'We facilitate the connection between customers, restaurants, and delivery personnel.',
        'We do not prepare food or operate restaurants; we are a technology platform.',
        'Services include online ordering, payment processing, and delivery coordination.',
        'We reserve the right to modify or discontinue services at any time.'
      ]
    },
    {
      title: 'User Accounts',
      icon: Shield,
      content: [
        'You must create an account to place orders and use certain features.',
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You must provide accurate and complete information when creating your account.',
        'You are responsible for all activities that occur under your account.',
        'We reserve the right to suspend or terminate accounts that violate these terms.'
      ]
    },
    {
      title: 'Orders and Payments',
      icon: Scale,
      content: [
        'All orders are subject to acceptance by the restaurant and availability of items.',
        'Prices are set by individual restaurants and may change without notice.',
        'Payment is due at the time of order placement.',
        'We accept major credit cards, debit cards, and digital payment methods.',
        'Delivery fees, service fees, and taxes will be clearly displayed before payment.',
        'You agree to pay all charges incurred on your account.'
      ]
    },
    {
      title: 'Prohibited Uses',
      icon: XCircle,
      content: [
        'Using the service for any unlawful purpose or in violation of these terms.',
        'Attempting to gain unauthorized access to our systems or other users\' accounts.',
        'Interfering with or disrupting the service or servers connected to the service.',
        'Transmitting viruses, malware, or other harmful code.',
        'Harassing, threatening, or discriminating against other users or our staff.',
        'Posting false, misleading, or inappropriate content.',
        'Using automated systems or bots to access the service.'
      ]
    },
    {
      title: 'Limitation of Liability',
      icon: AlertCircle,
      content: [
        'TastyCrave acts as a platform connecting customers with restaurants and is not responsible for food quality or preparation.',
        'We are not liable for any damages arising from your use of the service.',
        'Our total liability to you for any claim shall not exceed the amount you paid for the specific order.',
        'We are not responsible for delays, cancellations, or issues beyond our control.',
        'Food allergies and dietary restrictions are the responsibility of the customer and restaurant.',
        'We disclaim all warranties, express or implied, regarding the service.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Scale className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 mb-2">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 mb-4">
            Welcome to TastyCrave! These Terms of Service ("Terms") govern your use of our food delivery platform, 
            website, mobile application, and related services (collectively, the "Service"). These Terms constitute 
            a legally binding agreement between you and TastyCrave, Inc.
          </p>
          <p className="text-gray-600">
            By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. 
            We may update these Terms from time to time, and your continued use of the Service constitutes acceptance 
            of any changes.
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-6">
                <section.icon className="h-8 w-8 text-orange-500 mr-4" />
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Terms */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Terms</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Delivery services are provided by independent contractors or third-party delivery partners. 
              The following terms apply to all deliveries:
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <p className="text-gray-600"><strong>Delivery Time:</strong> Estimated delivery times are approximate and may vary due to weather, traffic, or high demand.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <p className="text-gray-600"><strong>Delivery Address:</strong> You must provide accurate delivery information. Additional charges may apply for incorrect addresses.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <p className="text-gray-600"><strong>Availability:</strong> You or an authorized person must be available to receive the delivery.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <p className="text-gray-600"><strong>Age Verification:</strong> Age verification may be required for certain orders (alcohol, age-restricted items).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation and Refunds */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cancellation and Refunds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600 text-sm">Orders can be cancelled within 2 minutes of placement</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600 text-sm">Restaurant may cancel due to item unavailability</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600 text-sm">Weather or emergency cancellations may occur</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Policy</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600 text-sm">Full refund for cancelled orders</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600 text-sm">Partial refunds for missing or incorrect items</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600 text-sm">Refunds processed within 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            All content, features, and functionality of our Service are owned by TastyCrave and are protected by 
            copyright, trademark, and other intellectual property laws.
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600">You may not copy, modify, distribute, or create derivative works of our content</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600">Our trademarks and logos may not be used without written permission</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600">User-generated content remains your property but grants us license to use</p>
            </div>
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dispute Resolution</h2>
          <p className="text-gray-600 mb-4">
            We encourage users to contact our customer service team first to resolve any issues. For formal disputes:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1. Customer Service</h4>
                <p className="text-gray-600 text-sm">Contact our support team at support@tastycrave.com or +1-555-123-4567</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2. Mediation</h4>
                <p className="text-gray-600 text-sm">If unresolved, disputes may be submitted to mediation through a neutral third party</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3. Arbitration</h4>
                <p className="text-gray-600 text-sm">Final disputes will be resolved through binding arbitration in New York, NY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law</h2>
          <p className="text-gray-600">
            These Terms are governed by and construed in accordance with the laws of the State of New York, 
            without regard to its conflict of law principles. Any legal action or proceeding arising under 
            these Terms will be brought exclusively in the courts of New York, NY.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 mt-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Questions About These Terms?</h3>
          <p className="text-gray-600 mb-6">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> legal@tastycrave.com
            </p>
            <p className="text-sm text-gray-600">
              <strong>Phone:</strong> +1-555-123-4567
            </p>
            <p className="text-sm text-gray-600">
              <strong>Address:</strong> TastyCrave Legal Department, 456 Broadway, New York, NY 10013
            </p>
          </div>
        </div>

        {/* Agreement */}
        <div className="bg-gray-100 rounded-lg p-6 mt-8 text-center">
          <p className="text-sm text-gray-600">
            By continuing to use TastyCrave, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
