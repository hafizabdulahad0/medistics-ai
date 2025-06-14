import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Moon,
  Sun,
  ClipboardCopy, // Icon for copy action
  CheckCircle, // Icon for success
  XCircle // Icon for error
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import { useTheme } from 'next-themes';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import React, { useState } from 'react'; // Import React and useState for local state
import { Badge } from '@/components/ui/badge'; // Import Badge component

const Checkout = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchParams] = useSearchParams(); // Hook to access URL query parameters
  const [copyStatus, setCopyStatus] = useState<{ id: string | null; success: boolean | null }>({ id: null, success: null });

  // Extract plan details from URL query parameters
  const planName = searchParams.get('planName');
  const price = searchParams.get('price');
  const duration = searchParams.get('duration');
  const currency = searchParams.get('currency');

  // Payment methods data
  const paymentMethods = [
    {
      name: 'Jazzcash',
      currency: 'PKR',
      details: [
        { label: 'Mobile Number', value: '03166891212', id: 'jazzcash-num' },
        { label: 'Recipient Name', value: 'Medisticsapp', id: 'jazzcash-name' }
      ],
      recommended: true
    },
    {
      name: 'Easypaisa',
      currency: 'PKR',
      details: [
        { label: 'Mobile Number', value: '03166891212', id: 'easypaisa-num' },
        { label: 'Recipient Name', value: 'Muhammad Ameer Hamza', id: 'easypaisa-name' }
      ],
      recommended: false
    },
    {
      name: 'Bank Account',
      currency: 'PKR',
      details: [
        { label: 'Account Number', value: '05130111999931', id: 'bank-account-num' },
        { label: 'Recipient Name', value: 'Abdul Ahad', id: 'bank-account-name' },
        { label: 'Bank Name', value: 'Meezan Bank', id: 'bank-name' }
      ],
      recommended: false
    },
    {
      name: 'Binance UID',
      currency: 'USD',
      details: [
        { label: 'Binance UID (USDT)', value: '992801941', id: 'binance-uid' }
      ],
      recommended: false
    }
  ];

  const handleCopyToClipboard = (text: string, id: string) => {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; // Prevents scrolling to bottom of page
      textarea.style.opacity = '0'; // Makes it invisible
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy'); // Execute copy command
      document.body.removeChild(textarea); // Clean up
      setCopyStatus({ id, success: true });
      setTimeout(() => setCopyStatus({ id: null, success: null }), 2000); // Reset status after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus({ id, success: false });
      setTimeout(() => setCopyStatus({ id: null, success: null }), 2000); // Reset status after 2 seconds
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
      {/* Header - Consistent with Dashboard */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/bf69a7f7-550a-45a1-8808-a02fb889f8c5.png"
              alt="Medistics Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Checkout</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 p-0 hover:scale-110 transition-transform duration-200"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {user ? (
              <ProfileDropdown />
            ) : (
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Checkout Section */}
      <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 max-w-4xl">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Purchase
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Review your selected plan and choose a payment method.
          </p>
        </div>

        {/* Selected Plan Summary */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800 shadow-xl mb-10 p-6 rounded-xl animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-purple-700 dark:text-purple-300">Your Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 dark:text-gray-300">
            <div className="flex justify-between items-center mb-2">
              <span>Plan:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{planName}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Duration:</span>
              <span className="font-semibold text-gray-900 dark:text-white capitalize">{duration}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currency === 'PKR' ? 'PKR ' : '$'}{price}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="mb-10">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.filter(method => method.currency === currency).map((method, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 rounded-xl animate-fade-in-up">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-300">{method.name}</CardTitle>
                  {method.recommended && (
                    <Badge className="bg-green-500 text-white">Recommended</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {method.details.map((detail, detailIdx) => (
                    <div key={detailIdx} className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{detail.label}:</span>
                      <div className="flex items-center justify-between mt-1">
                        <span id={detail.id} className="font-medium text-gray-900 dark:text-white break-all pr-2">
                          {detail.value}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => handleCopyToClipboard(detail.value, detail.id)}
                        >
                          {copyStatus.id === detail.id ? (
                            copyStatus.success ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )
                          ) : (
                            <ClipboardCopy className="w-4 h-4 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Please make the payment to the above details and send a screenshot to our support.
                  </p>
                </CardContent>
              </Card>
            ))}
            {paymentMethods.filter(method => method.currency !== currency).length > 0 && (
              <p className="md:col-span-2 text-center text-gray-500 dark:text-gray-400 mt-4">
                Switch to {currency === 'PKR' ? 'USD' : 'PKR'} to see other payment options.
              </p>
            )}
          </div>
        </div>

        {/* Note about Autopayment */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm italic">
          <p>Our autopayment approval system is on the way for a seamless experience!</p>
        </div>
      </section>

      {/* Footer Text - Consistent with Dashboard */}
      <div className="text-center mt-12 mb-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>A Project by Educational Spot.</p>
        <p>&copy; 2025 Medistics. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Checkout;
