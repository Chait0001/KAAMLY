import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper to handle API requests and append JWT
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Get token if it exists
  const token = await SecureStore.getItemAsync('token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || 'Something went wrong. Please try again.');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Network error. Make sure your backend is running.');
  }
}
