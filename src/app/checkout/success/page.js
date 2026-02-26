'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown to redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/customer/profile';
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>

          <p className="text-gray-600 mb-2">
            Thank you for your purchase! Your payment has been processed successfully.
          </p>

          {sessionId && (
            <p className="text-sm text-gray-400 mb-6 font-mono">
              Session: {sessionId.substring(0, 20)}...
            </p>
          )}

          <div className="p-4 bg-green-50 rounded-lg mb-6">
            <p className="text-green-800 text-sm">
              ✅ Your order is confirmed and being processed.
            </p>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            Redirecting to your profile in {countdown} seconds...
          </p>

          <div className="flex gap-4">
            <Link
              href="/products"
              className="flex-1 px-4 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Browse More
            </Link>
            <Link
              href="/customer/profile"
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}