import * as Sentry from "@sentry/react";
import React from "react";

import { NetworkParams } from "../config";
import { useNetworkParam } from "./use-network-param";

export const useEthereumConfig = () => {
  const { data: ethereumConfigJSON, loading } = useNetworkParam([
    NetworkParams.ETHEREUM_CONFIG,
  ]);
  const ethereumConfig = React.useMemo(() => {
    if (!ethereumConfigJSON && !loading) {
      Sentry.captureMessage(
        `No ETH config found for network param ${NetworkParams.ETHEREUM_CONFIG}`
      );
      return null;
    } else if (!ethereumConfigJSON) {
      return null;
    }
    try {
      const [configJson] = ethereumConfigJSON;
      const config = JSON.parse(configJson);
      return config;
    } catch {
      Sentry.captureMessage("Ethereum config JSON is invalid");
      return null;
    }
  }, [ethereumConfigJSON, loading]);

  if (!ethereumConfig) {
    return null;
  }

  return {
    confirmations: ethereumConfig.confirmations,
  };
};
