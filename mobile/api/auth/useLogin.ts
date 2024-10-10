import { useMutation } from '@tanstack/react-query';
import apiClient from '../common/client';
import { setItem } from 'expo-secure-store';
import { StorageKeys } from '@/constants/StorageKeys';
import { router } from 'expo-router';

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) =>
      apiClient
        .post<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/sign-in', { email, password })
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
