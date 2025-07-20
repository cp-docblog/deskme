import React, { useState } from 'react';
import { useEffect } from 'react';
import { MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingData, confirmBooking, clearBookingData, submitBookingForConfirmation } = useBooking();
  const { user } = useAuth();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  if (!bookingData) {
    navigate('/booking');
    return null;
  }

  useEffect(() => {
    // Send WhatsApp confirmation code when component mounts
    const sendCode = async () => {
      try {
        if (submitBookingForConfirmation) {
          await submitBookingForConfirmation();
          setCodeSent(true);
        }
      } catch (error) {
        setError('Failed to send confirmation code. Please try again.');
      }
    };

    if (!codeSent) {
      sendCode();
    }
  }, [submitBookingForConfirmation, codeSent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await confirmBooking(confirmationCode);
      // Success - redirect to thank you page or dashboard
      clearBookingData();
      navigate('/', { 
        state: { message: 'Booking confirmed successfully! We will contact you shortly.' }
      });
    } catch (err) {
      setError('Invalid confirmation code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Confirm Your Booking
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              We've sent a confirmation code to your WhatsApp
            </p>
          </div>
        </div>
      </section>

      {/* Confirmation Section */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Booking Summary */}
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
                  <span className="font-bold text-yellow-600">${bookingData.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Confirmation */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-xl font-semibold text-black">WhatsApp Confirmation</h3>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      {codeSent ? 'Confirmation code sent!' : 'Sending confirmation code...'}
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      We've sent a confirmation code to your WhatsApp number: {bookingData.customerWhatsapp}
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      It may take a few minutes to arrive. 
                      {!user && (
                        <span className="font-medium"> Please do not close this page if you're not logged in.</span>
                      )}
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
                If you don't receive the confirmation code within 10 minutes, please contact us:
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Phone: +1 (555) 123-4567</p>
                <p className="text-sm text-gray-600">Email: support@desk4u.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConfirmationPage;