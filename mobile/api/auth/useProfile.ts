import { useQuery } from '@tanstack/react-query';
import apiClient from '../common/client';
import { User } from '../types';

export const useProFile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await apiClient.get<User>('/auth/profile');
      return res.data;
    },
    staleTime: 0,
  });
};
