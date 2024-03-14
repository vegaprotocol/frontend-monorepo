import { useConfig } from './use-config';

export function useSendTransaction() {
  const config = useConfig();
  return {
    sendTransaction: config.sendTransaction,
  };
}
