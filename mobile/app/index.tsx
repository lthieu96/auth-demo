import { useProFile } from '@/api/auth/useProfile';
import { StorageKeys } from '@/constants/StorageKeys';
import {
  Button,
  ButtonText,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { Box } from '@gluestack-ui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { deleteItemAsync } from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function index() {
  const { data, isLoading } = useProFile();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!data) {
      router.replace('/login');
    }
  }, [data, isLoading]);

  if (isLoading)
    return (
      <SafeAreaView className="bg-white">
        <Box h={'$full'} p={'$6'} justifyContent="center">
          <Spinner />
        </Box>
      </SafeAreaView>
    );

  const handleLogout = async () => {
    await deleteItemAsync(StorageKeys.accessToken);
    await deleteItemAsync(StorageKeys.refreshToken);
    queryClient.setQueryData(['profile'], null);
    router.replace('/login');
  };

  return (
    <SafeAreaView className="bg-white">
      <Box h={'$full'} p={'$6'}>
        <HStack justifyContent={'space-between'} alignItems="center">
          <VStack>
            <Heading size="xl">{data?.name}</Heading>
            <Text>{`Role: ${data?.role}`}</Text>
          </VStack>

          <Button action="negative" variant="link" onPress={handleLogout}>
            <ButtonText>Logout</ButtonText>
          </Button>
        </HStack>
      </Box>
    </SafeAreaView>
  );
}
