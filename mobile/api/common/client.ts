import { StorageKeys } from '@/constants/StorageKeys';
import axios from 'axios';
import { getItemAsync } from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: 'http://192.168.1.51:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getItemAsync(StorageKeys.accessToken);
  if (!token) {
    return config;
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
