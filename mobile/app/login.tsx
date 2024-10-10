import {
  Box,
  Button,
  ButtonText,
  Divider,
  Heading,
  HStack,
  Input,
  InputField,
  Spinner,
  Text,
  Toast,
  ToastDescription,
  useToast,
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/api/auth/useLogin';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useGoogleLogin } from '@/api/auth/useGoogleLogin';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  scopes: ['email', 'profile'],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type LoginData = z.infer<typeof loginSchema>;

export default function login() {
  const toast = useToast();
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: googleLogin, isPending: isGGLoginPending } = useGoogleLogin();

  const form = useForm<LoginData>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const req = await GoogleSignin.signIn();
      if (!req.data?.idToken) {
        return;
      }
      googleLogin(
        { token: req.data.idToken },
        {
          onError: (err) => {
            toast.show({
              render: () => (
                <Toast action="error">
                  <ToastDescription>{err.data.message}</ToastDescription>
                </Toast>
              ),
            });
          },
        },
      );
    } catch (error) {
      toast.show({
        render: () => (
          <Toast>
            <ToastDescription>{error.message}</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="bg-white">
        <Box justifyContent={'center'} h={'$full'} p={'$6'}>
          <Heading size="2xl">Login</Heading>
          <VStack space="lg" mt={'$5'}>
            <VStack space="xs">
              <Text color="$textLight700" lineHeight="$xs">
                Email
              </Text>
              <Input isInvalid={!!form.formState.errors.email}>
                <InputField
                  value={form.watch('email')}
                  onChangeText={(val) => form.setValue('email', val)}
                  type="text"
                />
              </Input>
            </VStack>
            <VStack space="xs">
              <Text color="$textLight700" lineHeight="$xs">
                Password
              </Text>
              <Input isInvalid={!!form.formState.errors.password}>
                <InputField
                  type="password"
                  value={form.watch('password')}
                  onChangeText={(val) => form.setValue('password', val)}
                />
              </Input>
            </VStack>
            <Button
              onPress={form.handleSubmit((val) => {
                Keyboard.dismiss();
                login(val, {
                  onError: (err) => {
                    toast.show({
                      render: () => (
                        <Toast action="error">
                          <ToastDescription>
                            {err.data.message}
                          </ToastDescription>
                        </Toast>
                      ),
                    });
                  },
                });
              })}
            >
              <ButtonText>
                {isLoginPending ? <Spinner color={'white'} /> : 'Login'}
              </ButtonText>
            </Button>

            <HStack space="sm" mt="$3" alignItems="center" w={'$full'}>
              <Divider bg="$trueGray200" w={'$5'} />
              <Text size="xs">OR</Text>
              <Divider bg="$trueGray200" w={'$16'} />
            </HStack>

            <Button
              mt="$3"
              variant="outline"
              action="secondary"
              onPress={handleGoogleLogin}
            >
              <HStack space="sm" alignItems="center">
                <ButtonText>Login with Google</ButtonText>

                {isGGLoginPending ? <Spinner /> : null}
              </HStack>
            </Button>
          </VStack>
        </Box>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
