import {
  EthereumChainId,
  EthereumChainNames,
} from "@vegaprotocol/smart-contracts-sdk";
import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "react-i18next";

import {
  useEagerConnect,
  useWeb3Connect,
  useWeb3Listeners,
} from "../../hooks/use-web3";
import { SplashLoader } from "../splash-loader";
import { SplashScreen } from "../splash-screen";

interface Web3ConnectorProps {
  children: React.ReactElement;
}

export function Web3Connector({ children }: Web3ConnectorProps) {
  useWeb3Listeners();
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const { disconnect } = useWeb3Connect();
  const tried = useEagerConnect();

  const chainStr = `0x${chainId}`;
  // Chain ID retrieved from provider isn't the same as what the app is
  // configured to work with. Prevent further actions with splash screen
  if (chainStr !== process.env.REACT_APP_CHAIN && chainId) {
    const currentChain = EthereumChainNames[chainStr as EthereumChainId];
    const desiredChain =
      EthereumChainNames[process.env.REACT_APP_CHAIN as EthereumChainId];
    return (
      <SplashScreen>
        <div>
          <p>
            {/* If we can find a friendly name for chain use it else fall back to generic message */}
            {currentChain
              ? t("wrongNetwork", { chain: currentChain })
              : t("wrongNetworkUnknownChain", { chain: desiredChain })}
            {t("Desired network", {
              chain: desiredChain,
            })}
          </p>
          <button onClick={disconnect} type="button">
            {t("disconnect")}
          </button>
        </div>
      </SplashScreen>
    );
  }

  if (!tried) {
    return (
      <SplashScreen>
        <SplashLoader></SplashLoader>
      </SplashScreen>
    );
  }

  return children;
}
