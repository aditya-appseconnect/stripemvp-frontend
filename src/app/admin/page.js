'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sellers, setSellers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchSeller, setSearchSeller] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [sellersRes, customersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/Admin/sellers`),
        fetch(`${API_URL}/api/Admin/customers`),
        fetch(`${API_URL}/api/Admin/stats`)
      ]);

      const [sellersData, customersData, statsData] = await Promise.all([
        sellersRes.json(),
        customersRes.json(),
        statsRes.json()
      ]);

      setSellers(sellersData);
      setCustomers(customersData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter(s =>
    s.email.toLowerCase().includes(searchSeller.toLowerCase()) ||
    (s.referralCode || '').toLowerCase().includes(searchSeller.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.email.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    (c.referralCodeUsed || '').toLowerCase().includes(searchCustomer.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Admin Panel</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-indigo-500 capitalize">{activeTab}</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            ← Back to site
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sellers', value: stats?.totalSellers ?? 0, sub: `${stats?.onboardedSellers ?? 0} onboarded`, color: 'text-indigo-600' },
            { label: 'Total Customers', value: stats?.totalCustomers ?? 0, sub: 'registered accounts', color: 'text-violet-600' },
            { label: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, sub: `${stats?.totalPurchases ?? 0} purchases`, color: 'text-emerald-600' },
            { label: 'Commissions Paid', value: `$${(stats?.totalCommissions ?? 0).toFixed(2)}`, sub: `$${(stats?.platformRevenue ?? 0).toFixed(2)} platform kept`, color: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 mb-2">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {['overview', 'sellers', 'customers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Sellers */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Recent Sellers</h3>
                <button onClick={() => setActiveTab('sellers')} className="text-xs text-indigo-500 hover:text-indigo-700 transition">
                  View all →
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {sellers.slice(0, 5).map(seller => (
                  <div key={seller.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm text-gray-800">{seller.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        {seller.referralCode
                          ? seller.referralCode.substring(0, 18) + '...'
                          : 'No referral code'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        seller.onboardingCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {seller.onboardingCompleted ? 'Active' : 'Pending'}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">${seller.totalCommissions.toFixed(2)} earned</p>
                    </div>
                  </div>
                ))}
                {sellers.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">No sellers yet</div>
                )}
              </div>
            </div>

            {/* Recent Customers */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Recent Customers</h3>
                <button onClick={() => setActiveTab('customers')} className="text-xs text-indigo-500 hover:text-indigo-700 transition">
                  View all →
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {customers.slice(0, 5).map(customer => (
                  <div key={customer.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm text-gray-800">{customer.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {customer.referredBy
                          ? <>via <span className="text-indigo-500">{customer.referredBy}</span></>
                          : 'Direct signup'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">${customer.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{customer.totalPurchases} purchases</p>
                    </div>
                  </div>
                ))}
                {customers.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">No customers yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SELLERS TAB */}
        {activeTab === 'sellers' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-700">
                All Sellers <span className="text-gray-400 font-normal">({filteredSellers.length})</span>
              </h3>
              <input
                type="text"
                placeholder="Search by email or code..."
                value={searchSeller}
                onChange={e => setSearchSeller(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 w-56"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Referral Code</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Referrals</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Commissions</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSellers.map(seller => (
                    <tr key={seller.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 text-sm text-gray-800">{seller.email}</td>
                      <td className="px-5 py-3.5">
                        {seller.referralCode
                          ? <span className="font-mono text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                              {seller.referralCode.substring(0, 20)}...
                            </span>
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          seller.onboardingCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {seller.onboardingCompleted ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{seller.totalReferrals}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-emerald-600">
                        ${seller.totalCommissions.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {new Date(seller.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                  {filteredSellers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                        No sellers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-gray-700">
                All Customers <span className="text-gray-400 font-normal">({filteredCustomers.length})</span>
              </h3>
              <input
                type="text"
                placeholder="Search by email or referral..."
                value={searchCustomer}
                onChange={e => setSearchCustomer(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 w-56"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Referred By</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Referral Code</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Purchases</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Total Spent</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 text-sm text-gray-800">{customer.email}</td>
                      <td className="px-5 py-3.5">
                        {customer.referredBy
                          ? <span className="text-sm text-indigo-500">{customer.referredBy}</span>
                          : <span className="text-xs text-gray-300">Direct signup</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        {customer.referralCodeUsed
                          ? <span className="font-mono text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                              {customer.referralCodeUsed.substring(0, 20)}...
                            </span>
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{customer.totalPurchases}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-emerald-600">
                        ${customer.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}