import { useConfig } from './use-config';

export function useConnect() {
  const config = useConfig();
  return {
    connectors: config.connectors,
    connect: config.connect,
  };
}
