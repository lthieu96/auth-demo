import { useQueryAllUser } from '@/api/users/useQueryAllUser';
import { FontAwesome } from '@expo/vector-icons';
import { ButtonText, HStack, VStack } from '@gluestack-ui/themed';
import { Box, Button, Spinner, Text } from '@gluestack-ui/themed';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Users() {
  const { data, isLoading, error, refetch } = useQueryAllUser();

  if (error) {
    return (
      <SafeAreaView className="bg-white">
        <VStack
          h={'$full'}
          px={'$6'}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="$red600" size="lg">
            {error.data.message}
          </Text>

          <Button onPress={() => refetch()} variant="link" size="xs">
            <ButtonText>Try Again</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="bg-white">
        <Box h={'$full'} px={'$6'} justifyContent="center">
          <Spinner />
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white">
      <Box h={'$full'} px={'$6'} rounded={'$md'}>
        {data?.map((user) => (
          <HStack key={user.id} space="sm" alignItems="center" py={'$4'}>
            <FontAwesome name="user-circle" size={32} color="gray" />
            <VStack>
              <Text>{user.name}</Text>
              <Text size="sm">{user.email}</Text>
            </VStack>
          </HStack>
        ))}
      </Box>
    </SafeAreaView>
  );
}
