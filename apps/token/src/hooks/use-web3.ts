import { useWeb3React } from "@web3-react/core";
import React from "react";

import { AllowedConnectors, injected, networkOnly } from "../lib/connectors";

export function useWeb3Connect() {
  const { activate, deactivate } = useWeb3React();

  // Connects to given connector after deactivating network only connector
  const connect = React.useCallback(
    (connector: AllowedConnectors) => {
      deactivate();
      setTimeout(() => {
        activate(connector);
      }, 0);
    },
    [activate, deactivate]
  );

  // Reconnects to network only connector after disconnecting
  const disconnect = React.useCallback(() => {
    deactivate();
    setTimeout(() => {
      activate(networkOnly);
    }, 0);
  }, [activate, deactivate]);

  return { connect, disconnect };
}

// This hook only eager connects to injected providers
export function useEagerConnect() {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        activate(networkOnly, undefined, true).catch(() => {
          setTried(true);
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  React.useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

export function useWeb3Listeners() {
  const { active, error, activate } = useWeb3React();

  React.useEffect(() => {
    const { ethereum } = window;
    if (ethereum && ethereum.on && !active && !error) {
      const handleConnect = () => {
        activate(injected);
      };
      const handleChainChanged = () => {
        activate(injected);
      };
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          activate(injected);
        }
      };
      const handleNetworkChanged = () => {
        activate(injected);
      };

      ethereum.on("connect", handleConnect);
      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("networkChanged", handleNetworkChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("connect", handleConnect);
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("networkChanged", handleNetworkChanged);
        }
      };
    }
  }, [active, error, activate]);
}
