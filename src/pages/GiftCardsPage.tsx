import React, { useState } from 'react';
import { Gift, CreditCard, Heart, Star, Clock, Check } from 'lucide-react';

const GiftCardsPage: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [giftCardType, setGiftCardType] = useState('digital');

  const predefinedAmounts = ['25', '50', '100', '150', '200'];

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = customAmount || selectedAmount;
    alert(`Gift card purchase initiated for $${amount}! You will be redirected to payment processing.`);
  };

  const benefits = [
    {
      icon: Clock,
      title: 'Never Expires',
      description: 'Our gift cards never expire, so your recipient can use them whenever they want'
    },
    {
      icon: Heart,
      title: 'Perfect for Any Occasion',
      description: 'Birthdays, holidays, thank you gifts, or just because - food makes everyone happy'
    },
    {
      icon: Star,
      title: 'Instant Delivery',
      description: 'Digital gift cards are delivered instantly via email, or schedule for a future date'
    },
    {
      icon: Check,
      title: 'Easy to Use',
      description: 'Recipients can easily redeem online or show the code for phone orders'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      rating: 5,
      comment: 'Bought a gift card for my mom\'s birthday. She loved being able to try different dishes from the menu!'
    },
    {
      name: 'Michael R.',
      rating: 5,
      comment: 'Perfect corporate gift! Our team loved having the flexibility to order their favorite meals.'
    },
    {
      name: 'Lisa K.',
      rating: 5,
      comment: 'The digital delivery was so convenient. My friend received it instantly and ordered dinner that same night!'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Gift className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-orange-500">Gift</span> Cards
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Give the gift of delicious food! Perfect for any occasion, our gift cards let your loved ones 
            enjoy their favorite meals from TastyCrave.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gift Card Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Gift Card</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gift Card Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Gift Card Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="giftCardType"
                      value="digital"
                      checked={giftCardType === 'digital'}
                      onChange={(e) => setGiftCardType(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Digital</div>
                      <div className="text-sm text-gray-500">Instant email delivery</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="giftCardType"
                      value="physical"
                      checked={giftCardType === 'physical'}
                      onChange={(e) => setGiftCardType(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Physical</div>
                      <div className="text-sm text-gray-500">Mailed card (5-7 days)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-3 border rounded-lg font-semibold ${
                        selectedAmount === amount
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="customAmount" className="block text-sm text-gray-600 mb-2">
                    Or enter custom amount:
                  </label>
                  <input
                    type="number"
                    id="customAmount"
                    min="10"
                    max="500"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Recipient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="senderName"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Delivery Date (for digital cards) */}
              {giftCardType === 'digital' && (
                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date (optional)
                  </label>
                  <input
                    type="date"
                    id="deliveryDate"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave blank for immediate delivery
                  </p>
                </div>
              )}

              {/* Personal Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (optional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message for the recipient..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Purchase Gift Card - ${customAmount || selectedAmount || '0'}
              </button>
            </form>
          </div>

          {/* Benefits */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Why Choose Our Gift Cards?</h3>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <benefit.icon className="h-6 w-6 text-orange-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Gift Card Preview */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-lg text-white">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">TastyCrave</h3>
                  <Gift className="h-8 w-8" />
                </div>
                <p className="text-lg mb-2">Gift Card</p>
                <p className="text-3xl font-bold mb-4">$50.00</p>
                <p className="text-sm opacity-90">Card Code: TASTE-XXXX-XXXX-XXXX</p>
                <p className="text-xs opacity-75 mt-2">Valid for all menu items • Never expires</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I redeem a gift card?</h3>
              <p className="text-gray-600">Simply enter the gift card code at checkout when placing your order online, or provide the code when calling to place an order.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I check my gift card balance?</h3>
              <p className="text-gray-600">Yes! You can check your balance by calling us at +1-555-123-4567 or by entering your gift card code on our website.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I use multiple gift cards for one order?</h3>
              <p className="text-gray-600">Absolutely! You can combine multiple gift cards or use a gift card along with other payment methods.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What if I lose my gift card?</h3>
              <p className="text-gray-600">For digital gift cards, you can always find them in your email. For physical cards, please contact us immediately with your purchase information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardsPage;
