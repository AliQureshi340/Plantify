import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { X, Truck, MapPin, Check, CreditCard, Loader } from 'lucide-react';

// ✅ Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51TUNoZRwOW3ZdG7HRyPhdBQTDlKdS6YoAbODoR2e8unFpmo49CBqUpIn8EqauNx31CrvP1vwCreFbvOgnIdv3o5j002Fn2xIJF');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

// ─── Inner form (needs Stripe context) ───────────────────────────────────────
const StripePaymentForm = ({
  customerInfo,
  setCustomerInfo,
  deliveryType,
  setDeliveryType,
  cart,
  calculateTotal,
  calculateDiscountAmount,
  placeOrder,
  setShowCheckout,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    const { name, email, phone, address, city } = customerInfo;
    if (!name || !email || !phone || !address || !city) {
      setPaymentError('Please fill in all required fields.');
      return;
    }
    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentError('');

    try {
      // 1. Create PaymentIntent on backend
      const res = await fetch('http://localhost:5000/api/orders/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: calculateTotal() }),
      });

      if (!res.ok) throw new Error('Failed to create payment intent');
      const { clientSecret } = await res.json();

      // 2. Confirm card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: { name, email },
        },
      });

      if (error) {
        setPaymentError(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // 3. Place order in your backend
        await placeOrder(paymentIntent.id);
      }
    } catch (err) {
      setPaymentError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Checkout
          </h2>
          <button
            onClick={() => setShowCheckout(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 hover:rotate-90 transform"
          >
            <X />
          </button>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Full Name *</label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Email *</label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
          <textarea
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
            rows="3"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">City *</label>
            <input
              type="text"
              value={customerInfo.city}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Postal Code</label>
            <input
              type="text"
              value={customerInfo.postalCode}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200"
            />
          </div>
        </div>

        {/* Delivery Option */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">Delivery Option</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors duration-200">
              <input
                type="radio"
                name="deliveryType"
                value="delivery"
                checked={deliveryType === 'delivery'}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="text-green-500"
              />
              <Truck size={20} className="text-green-600" />
              <span className="font-semibold">Home Delivery</span>
            </label>
            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors duration-200">
              <input
                type="radio"
                name="deliveryType"
                value="pickup"
                checked={deliveryType === 'pickup'}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="text-green-500"
              />
              <MapPin size={20} className="text-green-600" />
              <span className="font-semibold">Store Pickup</span>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl mb-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h4>
          {cart.map(item => {
            const discountedPrice = item.price - calculateDiscountAmount(item);
            return (
              <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="font-semibold text-gray-800">
                  Rs {(discountedPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            );
          })}
          <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-green-500">
            <span className="text-xl font-bold text-gray-800">Total:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Rs {calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Stripe Card Fields ── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-green-600" />
            Card Details
          </h4>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
              <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus-within:border-green-500 transition-colors duration-200">
                <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus-within:border-green-500 transition-colors duration-200">
                  <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>
              {/* CVC */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">CVC</label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus-within:border-green-500 transition-colors duration-200">
                  <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Error */}
          {paymentError && (
            <p className="mt-3 text-sm text-red-600 font-medium bg-red-50 px-4 py-2 rounded-xl">
              {paymentError}
            </p>
          )}
        </div>

        {/* Pay Button */}
        <button
          onClick={handleSubmit}
          disabled={processing || !stripe}
          className={`w-full py-4 px-6 font-bold text-lg rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
            processing || !stripe
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {processing ? (
            <>
              <Loader size={20} className="animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Check size={20} />
              Pay Rs {calculateTotal().toLocaleString()}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Exported wrapper — wraps form in Stripe Elements provider ───────────────
const CheckoutModal = (props) => {
  if (!props.showCheckout) return null;

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

export default CheckoutModal;