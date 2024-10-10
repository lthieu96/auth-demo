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
import { router } from 'expo-router';
import { deleteItemAsync } from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function index() {
  const { data } = useProFile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await deleteItemAsync(StorageKeys.accessToken);
    await deleteItemAsync(StorageKeys.refreshToken);
    queryClient.resetQueries();
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
