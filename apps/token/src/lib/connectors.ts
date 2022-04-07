import { ChainIdMap } from "@vegaprotocol/smart-contracts-sdk";
import { InjectedConnector } from "@web3-react/injected-connector";
import { NetworkConnector } from "@web3-react/network-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

import { APP_CHAIN_ID, InfuraUrls } from "../config";

export type AllowedConnectors =
  | NetworkConnector
  | InjectedConnector
  | WalletConnectConnector;

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 1337],
});

export const walletConnect = new WalletConnectConnector({
  rpc: {
    1: InfuraUrls["0x1"],
    3: InfuraUrls["0x3"],
  },
  qrcode: true,
});

export const networkOnly = new NetworkConnector({
  urls: {
    1: InfuraUrls["0x1"],
    3: InfuraUrls["0x3"],
  },
  defaultChainId: ChainIdMap[APP_CHAIN_ID],
});

export const NETWORK_KEY = "networkOnly";

export const Connectors = {
  injected,
  walletConnect,
  [NETWORK_KEY]: networkOnly,
};
