import { useQuery } from '@tanstack/react-query';
import apiClient from '../common/client';
import { User } from '../types';

export const useQueryAllUser = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get<User[]>('/users');
      return res.data;
    },
  });
};
