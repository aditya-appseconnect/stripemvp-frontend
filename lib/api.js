const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  // ✅ Always merge headers properly so Content-Type is never lost
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),  // Merge any extra headers AFTER setting Content-Type
    },
  };

  const response = await fetch(url, config);

  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || data.title || data || 'Something went wrong');
  }

  return data;
}

// ✅ Seller API calls
export const sellerApi = {
  register: (email, password) =>
    apiCall('/api/Sellers/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) =>
    apiCall('/api/Sellers/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: (token) =>
    apiCall('/api/Sellers/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ✅ NEW - Get seller stats and commission history
  getStats: (token) =>
    apiCall('/api/Sellers/stats', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),

  connectStripe: (token) =>
    apiCall('/api/Sellers/connect', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ✅ Customer API calls
export const customerApi = {
  register: (email, password, referralCode) =>
    apiCall('/api/Customers/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, referralCode }),
    }),

  login: (email, password) =>
    apiCall('/api/Customers/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: (token) =>
    apiCall('/api/Customers/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getPurchases: (token) =>
    apiCall('/api/Checkout/my-purchases', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ✅ Products API calls
export const productsApi = {
  getAll: () =>
    apiCall('/api/Products', {
      method: 'GET',
    }),

  getOne: (productId) =>
    apiCall(`/api/Products/${productId}`, {
      method: 'GET',
    }),
};

// ✅ Checkout API calls
export const checkoutApi = {
  createSession: (token, priceId) =>
    apiCall('/api/Checkout/create-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ priceId }),
    }),

  getPurchaseStatus: (token, purchaseId) =>
    apiCall(`/api/Checkout/purchase/${purchaseId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ✅ Auth helpers
export const auth = {
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  isAuthenticated: () => {
    return !!auth.getToken();
  },
};