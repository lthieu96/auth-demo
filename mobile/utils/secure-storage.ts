import { StorageKeys } from './../constants/StorageKeys';
import * as SecureStore from 'expo-secure-store';

export const setItem = async (key: StorageKeys, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

export const getItem = async (key: StorageKeys) => {
  return await SecureStore.getItemAsync(key);
};

export const removeItem = async (key: StorageKeys) => {
  await SecureStore.deleteItemAsync(key);
};
