'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi, checkoutApi, auth } from '@/lib/api';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyingProductId, setBuyingProductId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleBuy = async (priceId) => {
    // Check if customer is logged in
    if (!auth.isAuthenticated()) {
      router.push('/customer/login?redirect=/products');
      return;
    }

    setBuyingProductId(priceId);

    try {
      const response = await checkoutApi.createSession(auth.getToken(), priceId);

      // Redirect to Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      setBuyingProductId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Stripe Affiliate
            </Link>
            <div className="flex items-center gap-4">
              {auth.isAuthenticated() ? (
                <Link
                  href="/customer/profile"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
                >
                  My Profile
                </Link>
              ) : (
                <>
                  <Link
                    href="/customer/login"
                    className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/customer/register"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Our Products</h1>
          <p className="text-indigo-100 text-xl">
            Choose the plan that works best for you
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 text-xl">No products available yet</p>
            <p className="text-gray-400 mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col"
              >
                {/* Product Image */}
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}

                {/* Product Info */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-gray-600 mb-4 text-sm">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-4">
                    {product.price && (
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold text-gray-900">
                          ${product.price.amount.toFixed(2)}
                        </span>
                        <span className="text-gray-500">
                          {product.price.currency}
                        </span>
                        {product.price.interval && (
                          <span className="text-gray-500 text-sm">
                            /{product.price.interval}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badge for subscription vs one-time */}
                    <div className="mb-4">
                      {product.price?.interval ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          Subscription
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          One-time Payment
                        </span>
                      )}
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handleBuy(product.price?.id)}
                      disabled={buyingProductId === product.price?.id}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buyingProductId === product.price?.id
                        ? 'Redirecting to Checkout...'
                        : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}