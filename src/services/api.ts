import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Section 5 — API SERVICE PATTERN
 * Base fetch instance with JWT header and consistent response handling.
 */

const BASE_URL = 'https://schoolmanagement.mahispark.com/api';

const apiCall = async (method: string, endpoint: string, body?: any) => {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data.data;
};

export const api = {
  get: (endpoint: string) => apiCall('GET', endpoint),
  post: (endpoint: string, body: any) => apiCall('POST', endpoint, body),
  put: (endpoint: string, body: any) => apiCall('PUT', endpoint, body),
  delete: (endpoint: string, body?: any) => apiCall('DELETE', endpoint, body),
};

/**
 * DATE FORMAT: All dates must be sent as 'dd/MM/yyyy HH:mm:ss' format.
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
