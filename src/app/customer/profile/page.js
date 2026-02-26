'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi, auth } from '@/lib/api';

export default function CustomerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/customer/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = auth.getToken();

      // Load profile and purchases in parallel
      const [profileData, purchasesData] = await Promise.all([
        customerApi.getProfile(token),
        customerApi.getPurchases(token)
      ]);

      setProfile(profileData);
      setPurchases(purchasesData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.removeToken();
    router.push('/');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✓ Completed</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">⏳ Pending</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">✗ Failed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  const totalSpent = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-teal-600">Customer Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 text-sm">{profile?.email}</span>
              <button
                onClick={() => router.push('/products')}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
              >
                Browse Products
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Total Purchases</p>
            <p className="text-3xl font-bold text-gray-900">{purchases.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Referred By</p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {profile?.referralCodeUsed
                ? <span className="font-mono text-sm text-teal-600">{profile.referralCodeUsed}</span>
                : <span className="text-gray-400 text-base font-normal">No referral</span>
              }
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900 text-sm">{profile?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900 text-sm">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
              {profile?.referralCodeUsed && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-1">Referral Code Used</p>
                  <p className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded break-all">
                    {profile.referralCodeUsed}
                  </p>
                  <p className="text-xs text-green-600 mt-2">✓ Supporting a seller!</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase History */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Purchase History
            </h3>

            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500 font-medium mb-2">No purchases yet</p>
                <p className="text-gray-400 text-sm mb-4">Start shopping to see your orders here</p>
                <button
                  onClick={() => router.push('/products')}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition text-sm"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Icon */}
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>

                      {/* Purchase Info */}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {purchase.stripeProductId
                            ? `Product: ${purchase.stripeProductId.substring(0, 14)}...`
                            : 'Product Purchase'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Amount and Status */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${purchase.amount.toFixed(2)}</p>
                        {purchase.completedAt && (
                          <p className="text-xs text-gray-400">
                            {new Date(purchase.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(purchase.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}