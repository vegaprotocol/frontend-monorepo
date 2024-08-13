import type { QueryClient } from '@tanstack/react-query';
import { createStore } from 'zustand';

type Store = {
  baseUrl: string | undefined;
  queryClient: QueryClient | undefined;
};

export const REST_CONFIG = createStore<Store>()(() => ({
  baseUrl: undefined,
  queryClient: undefined,
}));

export const getBaseUrl = () => {
  const bu = REST_CONFIG.getState().baseUrl;
  if (!bu) {
    throw new Error('Base URL is not defined');
  }

  return bu;
};

export const getQueryClient = () => {
  const qc = REST_CONFIG.getState().queryClient;
  if (!qc) {
    throw new Error('QueryClient is not defined');
  }

  return qc;
};
