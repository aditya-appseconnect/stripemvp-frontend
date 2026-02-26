'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sellerApi, auth } from '@/lib/api';
import Link from 'next/link';

export default function SellerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [seller, setSeller] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/seller/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = auth.getToken();
      const [profileData, statsData] = await Promise.all([
        sellerApi.getProfile(token),
        sellerApi.getStats(token)
      ]);
      setSeller(profileData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setError('');
    setConnectingStripe(true);
    try {
      const response = await sellerApi.connectStripe(auth.getToken());
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      setError(err.message || 'Failed to connect Stripe account');
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleLogout = () => {
    auth.removeToken();
    router.push('/');
  };

  const copyReferralCode = () => {
    if (seller?.referralCode) {
      navigator.clipboard.writeText(seller.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✓ Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">⏳ Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">✗ Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
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
            <h1 className="text-xl font-bold text-indigo-600">Seller Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 text-sm">{seller?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium text-sm"
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

        {/* Onboarding Alert */}
        {!seller?.onboardingCompleted && seller?.stripeAccountId && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-900">Stripe Onboarding Incomplete</h4>
              <p className="text-sm text-yellow-800 mt-1">Complete Stripe onboarding to start receiving commissions!</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Total Referrals</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalReferrals ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Customers signed up</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalSales ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Completed purchases</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600">${(stats?.totalEarnings ?? 0).toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">5% commission earned</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">This Month</p>
            <p className="text-3xl font-bold text-indigo-600">${(stats?.thisMonthEarnings ?? 0).toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{stats?.thisMonthSales ?? 0} sales</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Stripe Connect Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Stripe Account</h3>
                <p className="text-sm text-gray-600">
                  {seller?.onboardingCompleted ? 'Connected & Verified ✓' : 'Connect to receive commissions'}
                </p>
              </div>
            </div>

            {seller?.onboardingCompleted ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800 font-medium text-sm">Stripe account connected!</span>
                </div>
                <p className="text-xs text-gray-500">
                  Account: <span className="font-mono">{seller?.stripeAccountId}</span>
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleConnectStripe}
                  disabled={connectingStripe}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {connectingStripe ? 'Connecting...' : seller?.stripeAccountId ? 'Continue Onboarding' : 'Connect Stripe Account'}
                </button>
                <p className="mt-3 text-sm text-gray-500">You'll be redirected to Stripe to complete setup</p>
              </>
            )}
          </div>

          {/* Referral Code Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Referral Code</h3>
                <p className="text-sm text-gray-600">Share with customers to earn 5% commission</p>
              </div>
            </div>

            {seller?.referralCode ? (
              <>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-sm font-bold text-gray-900 break-all">
                    {seller.referralCode}
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                  >
                    {copied
                      ? <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    }
                  </button>
                </div>
                <p className="text-xs text-gray-500">Customers enter this code at signup to link to your account</p>
              </>
            ) : (
              <div className="text-center py-6">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-gray-500 text-sm font-medium">Complete Stripe onboarding to get your referral code</p>
              </div>
            )}
          </div>
                        {seller?.referralCode ? (
                <div className="space-y-3">

                    <Link
                    href={`/customer/register?link=${seller.referralCode}`}
                    className="inline-block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                    Share Referral Link
                    </Link>

                </div>
                ) : (
                <p className="text-gray-500 text-sm">
                    Complete onboarding to get your referral link.
                </p>
                )}

        </div>

        {/* Commission History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Commission History
          </h3>

          {!stats?.recentPurchases?.length ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 font-medium mb-1">No commissions yet</p>
              <p className="text-gray-400 text-sm">Share your referral code to start earning!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Sale Amount</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Commission (5%)</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <p className="text-sm font-medium text-gray-900">{purchase.customerEmail}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-gray-900">${purchase.amount.toFixed(2)}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm font-bold text-green-600">+${purchase.commissionAmount.toFixed(2)}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-gray-500">
                          {new Date(purchase.completedAt || purchase.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="py-4">
                        {getStatusBadge(purchase.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={2} className="pt-4 text-sm font-semibold text-gray-700">Total Earned</td>
                    <td className="pt-4 text-sm font-bold text-green-600">
                      ${(stats?.totalEarnings ?? 0).toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}