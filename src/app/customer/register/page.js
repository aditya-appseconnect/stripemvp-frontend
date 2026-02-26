'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { customerApi, auth } from '@/lib/api';

export default function CustomerRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    referralCode: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralFromUrl, setReferralFromUrl] = useState(false);

  // ✅ Auto-fill referral code from ?link= param
  useEffect(() => {
    const referralFromParam = searchParams.get('link'); // 🔥 changed from 'ref' to 'link'

    if (referralFromParam) {
      setFormData((prev) => ({
        ...prev,
        referralCode: referralFromParam,
      }));
      setReferralFromUrl(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await customerApi.register(
        formData.email,
        formData.password,
        formData.referralCode || null
      );

      const loginResponse = await customerApi.login(
        formData.email,
        formData.password
      );

      auth.setToken(loginResponse.token);
      router.push('/customer/profile');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        <div className="mb-8">
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2">
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join as Customer
            </h1>
            <p className="text-gray-600">
              Create your account and start shopping
            </p>
          </div>

          {/* Referral Banner */}
          {referralFromUrl && (
            <div className="mb-6 p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-teal-700 text-sm">
                Referral code applied! You were referred by a seller.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength="6"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code{' '}
                {referralFromUrl ? (
                  <span className="text-teal-600 font-medium">✓ Applied</span>
                ) : (
                  <span className="text-gray-500 font-normal">(Optional)</span>
                )}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      referralCode: e.target.value,
                    });
                    setReferralFromUrl(false);
                  }}
                  className={`w-full px-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    referralFromUrl
                      ? 'border-teal-300 bg-teal-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter seller's referral code"
                />

                {referralFromUrl && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">
                    ✓
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/customer/login" className="text-teal-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
