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
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/api/auth/useLogin';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type LoginData = z.infer<typeof loginSchema>;

export default function login() {
  const { mutate: login, isPending: isLoginPending } = useLogin();

  const form = useForm<LoginData>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });

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
                login(val);
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

            <Button mt="$3" variant="outline" action="secondary">
              <ButtonText>Login with Google</ButtonText>
            </Button>
          </VStack>
        </Box>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
