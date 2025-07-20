import React, { useState } from 'react';
import { useEffect } from 'react';
import { MessageCircle, CheckCircle, AlertCircle, Phone, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../hooks/useContent';
import { supabase } from '../lib/supabase';

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingData, clearBookingData, confirmBooking } = useBooking();
  const { user } = useAuth();
  const { getSetting } = useContent();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  if (!bookingData) {
    // Try to get booking ID from session storage
    const storedBookingId = sessionStorage.getItem('currentBookingId');
    if (!storedBookingId) {
      navigate('/booking');
      return null;
    }
  }

  useEffect(() => {
    // Get booking ID from session storage
    const storedBookingId = sessionStorage.getItem('currentBookingId');
    if (storedBookingId) {
      setBookingId(storedBookingId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Use the enhanced finalizeBooking function from BookingContext
      await confirmBooking(confirmationCode);
      
      // Clear booking data from context
      clearBookingData();
      
      // Success - redirect to thank you page
      navigate('/', { 
        state: { message: 'Booking confirmed successfully! We will contact you shortly.' }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm booking. Please try again or contact support.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get payment phone number from settings
  const paymentPhone = getSetting('payment_phone', '+20 123 456 7890');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Complete Your Payment
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Transfer the amount and get your confirmation code
            </p>
          </div>
        </div>
      </section>

      {/* Confirmation Section */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Booking Summary */}
            {bookingData && (
              <div className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-4">Booking Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Workspace:</span>
                  <span className="font-medium">{bookingData.workspaceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(bookingData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{bookingData.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{bookingData.duration}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-bold text-yellow-600">E£{bookingData.totalPrice}</span>
                </div>
              </div>
              </div>
            )}

            {/* Payment Instructions */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <CreditCard className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-xl font-semibold text-black">Payment Instructions</h3>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium text-lg mb-2">
                      Transfer Payment To:
                    </p>
                    <p className="text-green-700 text-2xl font-bold mb-3">
                      {paymentPhone}
                    </p>
                    <p className="text-green-700 text-lg font-medium mb-2">
                      Amount: E£{bookingData?.totalPrice || 0}
                    </p>
                    <div className="text-green-600 text-sm space-y-1">
                      <p>• Transfer the exact amount via mobile money or bank transfer</p>
                      <p>• After payment, you will receive a confirmation code on WhatsApp</p>
                      <p>• The confirmation code may take 2-5 minutes to arrive</p>
                      <p>• Enter the code below to complete your booking</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Confirmation */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-xl font-semibold text-black">Enter Confirmation Code</h3>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      Waiting for payment confirmation
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      After completing the payment, you will receive a confirmation code on: {bookingData?.customerWhatsapp}
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      The code may take 2-5 minutes to arrive after payment.
                    </p>
                    <p className="text-blue-600 text-sm mt-2 font-medium">
                      Demo: Use code "123456" for testing
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Confirmation Code
                  </label>
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    required
                    placeholder="Enter 6-digit code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-500 text-black py-3 px-6 rounded-md font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-black mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-2">
                If you don't receive the confirmation code after payment, please contact us:
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Phone: {getSetting('contact_phone', '+20 123 456 7890')}</p>
                <p className="text-sm text-gray-600">Email: {getSetting('contact_email', 'support@desk4u.com')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConfirmationPage;