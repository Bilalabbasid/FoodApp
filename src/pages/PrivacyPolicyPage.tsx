import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = 'December 15, 2024';

  const sections = [
    {
      title: 'Information We Collect',
      icon: Database,
      content: [
        'Personal Information: Name, email address, phone number, delivery address, and payment information when you create an account or place an order.',
        'Order Information: Details about your food orders, preferences, and order history.',
        'Device Information: IP address, browser type, operating system, and device identifiers.',
        'Location Data: With your permission, we may collect your location to improve delivery services.',
        'Communication Records: Records of your communications with our customer service team.'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: UserCheck,
      content: [
        'Process and fulfill your food orders and delivery requests.',
        'Communicate with you about your orders, account, and our services.',
        'Provide customer support and respond to your inquiries.',
        'Improve our services, website functionality, and user experience.',
        'Send promotional emails and marketing communications (with your consent).',
        'Comply with legal obligations and protect against fraudulent activities.'
      ]
    },
    {
      title: 'Information Sharing',
      icon: Shield,
      content: [
        'Service Providers: We share information with trusted third-party service providers who help us operate our business (payment processors, delivery partners, cloud hosting services).',
        'Legal Requirements: We may disclose information when required by law, court order, or to protect our rights and safety.',
        'Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred.',
        'Consent: We may share information for other purposes with your explicit consent.'
      ]
    },
    {
      title: 'Data Security',
      icon: Lock,
      content: [
        'We implement industry-standard security measures to protect your personal information.',
        'All payment information is encrypted and processed through secure payment gateways.',
        'We regularly update our security practices and conduct security assessments.',
        'Access to personal information is limited to authorized personnel only.',
        'We use secure servers and encryption technologies to protect data transmission.'
      ]
    },
    {
      title: 'Your Rights and Choices',
      icon: Eye,
      content: [
        'Account Access: You can access and update your account information at any time.',
        'Marketing Communications: You can opt-out of promotional emails by clicking the unsubscribe link.',
        'Data Deletion: You can request deletion of your personal information (subject to legal requirements).',
        'Data Portability: You can request a copy of your personal information in a portable format.',
        'Correction: You can request correction of inaccurate personal information.'
      ]
    },
    {
      title: 'Contact Information',
      icon: Mail,
      content: [
        'If you have questions about this Privacy Policy or our data practices, please contact us:',
        'Email: privacy@tastycrave.com',
        'Phone: +1-555-123-4567',
        'Mail: TastyCrave Privacy Team, 456 Broadway, New York, NY 10013',
        'We will respond to your inquiries within 30 days.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 mb-2">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 mb-4">
            TastyCrave ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our food delivery service, 
            website, mobile application, or any related services.
          </p>
          <p className="text-gray-600">
            By using our services, you consent to the collection and use of your information as described in this Privacy Policy. 
            If you do not agree with our policies and practices, please do not use our services.
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

        {/* Cookies Policy */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies and Tracking Technologies</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, 
              and understand where our visitors are coming from.
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Types of Cookies We Use:</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Essential Cookies:</strong> Required for the website to function properly</div>
                <div><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</div>
                <div><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</div>
                <div><strong>Preference Cookies:</strong> Remember your settings and preferences</div>
              </div>
            </div>
            <p className="text-gray-600">
              You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our services.
            </p>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Retention</h2>
          <p className="text-gray-600 mb-4">
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600"><strong>Account Information:</strong> Retained while your account is active and for 3 years after account closure</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600"><strong>Order History:</strong> Retained for 7 years for tax and accounting purposes</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600"><strong>Marketing Data:</strong> Retained until you unsubscribe or for 2 years of inactivity</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600"><strong>Support Communications:</strong> Retained for 3 years for quality assurance</p>
            </div>
          </div>
        </div>

        {/* International Users */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">International Users</h2>
          <p className="text-gray-600 mb-4">
            Our services are primarily intended for users in the United States. If you are accessing our services from outside the United States, 
            please be aware that your information may be transferred to, stored, and processed in the United States.
          </p>
          <p className="text-gray-600">
            By using our services, you consent to the transfer of your information to the United States and the application of United States law 
            governing the collection and use of your information.
          </p>
        </div>

        {/* Updates */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy Updates</h2>
          <p className="text-gray-600 mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
            We will notify you of any material changes by:
          </p>
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600">Posting the updated policy on our website</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600">Sending an email notification to registered users</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p className="text-gray-600">Displaying a prominent notice on our website</p>
            </div>
          </div>
          <p className="text-gray-600 mt-4">
            Your continued use of our services after the effective date of the updated policy constitutes your acceptance of the changes.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 mt-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Questions About Our Privacy Policy?</h3>
          <p className="text-gray-600 mb-6">
            We're here to help. If you have any questions or concerns about how we handle your personal information, 
            please don't hesitate to reach out to our privacy team.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> privacy@tastycrave.com
            </p>
            <p className="text-sm text-gray-600">
              <strong>Phone:</strong> +1-555-123-4567
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
