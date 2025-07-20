import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface BookingData {
  workspaceType: string;
  date: string;
  timeSlot: string;
  duration: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerWhatsapp: string;
  totalPrice: number;
}

interface BookingContextType {
  bookingData: BookingData | null;
  setBookingData: (data: BookingData) => void;
  clearBookingData: () => void;
  confirmBooking: (confirmationCode: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const { user } = useAuth();

  const clearBookingData = () => {
    setBookingData(null);
  };

  const confirmBooking = async (confirmationCode: string) => {
    if (!bookingData) throw new Error('No booking data available');
    
    try {
      // Save booking to Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          workspace_type: bookingData.workspaceType,
          date: bookingData.date,
          time_slot: bookingData.timeSlot,
          duration: bookingData.duration,
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
          customer_whatsapp: bookingData.customerWhatsapp,
          total_price: bookingData.totalPrice,
          confirmation_code: confirmationCode,
          user_id: user?.id || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Mock WhatsApp confirmation for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // The booking is now saved and will appear in admin dashboard
      console.log('Booking saved:', data);
      
    } catch (error) {
      console.error('Booking confirmation failed:', error);
      throw new Error('Failed to confirm booking. Please try again.');
    }
  };

  const generateConfirmationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendWhatsAppCode = async (phoneNumber: string) => {
    // Mock WhatsApp sending - in production, integrate with WhatsApp Business API
    const code = generateConfirmationCode();
    console.log(`Sending WhatsApp code ${code} to ${phoneNumber}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return code;
  };

  const submitBookingForConfirmation = async () => {
    if (!bookingData) throw new Error('No booking data available');
    
    try {
      // In a real implementation, you would send the WhatsApp code here
      const confirmationCode = await sendWhatsAppCode(bookingData.customerWhatsapp);
      
      // Store the expected confirmation code temporarily
      // In production, you might want to store this securely
      sessionStorage.setItem('expectedConfirmationCode', confirmationCode);
      
      return confirmationCode;
    } catch (error) {
      console.error('Failed to send WhatsApp code:', error);
      throw new Error('Failed to send confirmation code. Please try again.');
    }
  };

  const verifyConfirmationCode = (enteredCode: string): boolean => {
    const expectedCode = sessionStorage.getItem('expectedConfirmationCode');
    return enteredCode === expectedCode;
  };

  const finalizeBooking = async (confirmationCode: string) => {
    if (!bookingData) throw new Error('No booking data available');
    
    // Verify the confirmation code
    if (!verifyConfirmationCode(confirmationCode)) {
      throw new Error('Invalid confirmation code');
    }
    
    try {
      // Save booking to Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          workspace_type: bookingData.workspaceType,
          date: bookingData.date,
          time_slot: bookingData.timeSlot,
          duration: bookingData.duration,
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
          customer_whatsapp: bookingData.customerWhatsapp,
          total_price: bookingData.totalPrice,
          confirmation_code: confirmationCode,
          user_id: user?.id || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Clean up the stored confirmation code
      sessionStorage.removeItem('expectedConfirmationCode');
      
      console.log('Booking saved successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Booking save failed:', error);
      throw new Error('Failed to save booking. Please try again.');
    }
  };

  const sendWebhook = async (bookingId: string, action: string) => {
    try {
      await fetch('https://example.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          action,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Webhook failed:', error);
      // Don't throw error for webhook failures
    }
  };

  return (
    <BookingContext.Provider value={{ 
      bookingData, 
      setBookingData, 
      clearBookingData, 
      confirmBooking: finalizeBooking,
      submitBookingForConfirmation,
      sendWebhook
    }}>
      {children}
    </BookingContext.Provider>
  );
};