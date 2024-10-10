import {
  Box,
  Button,
  ButtonText,
  Divider,
  Heading,
  HStack,
  Input,
  InputField,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function login() {
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
              <Input>
                <InputField type="text" />
              </Input>
            </VStack>
            <VStack space="xs">
              <Text color="$textLight700" lineHeight="$xs">
                Password
              </Text>
              <Input>
                <InputField type="password" />
              </Input>
            </VStack>
            <Button>
              <ButtonText>Login</ButtonText>
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
