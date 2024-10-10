import { useProFile } from '@/api/auth/useProfile';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Box, Spinner } from '@gluestack-ui/themed';
import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { data, isLoading } = useProFile();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!data) {
      router.replace('/login');
    }
  }, [data, isLoading]);

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
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Posts',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="paper-plane" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
