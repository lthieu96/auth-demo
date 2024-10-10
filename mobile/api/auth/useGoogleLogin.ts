import { useMutation } from '@tanstack/react-query';
import apiClient from '../common/client';
import { setItem } from 'expo-secure-store';
import { StorageKeys } from '@/constants/StorageKeys';
import { router } from 'expo-router';

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: async ({ token }: { token: string }) =>
      apiClient
        .post<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/google', { token })
        .then((res) => res.data),
    onError: (error) => {
      console.error(error);
      throw error;
    },
    onSuccess: async (data) => {
      const { accessToken, refreshToken } = data;
      await Promise.all([
        setItem(StorageKeys.accessToken, accessToken),
        setItem(StorageKeys.refreshToken, refreshToken),
      ]);
      router.replace('/');
    },
  });
};
