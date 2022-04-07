import { VegaLPStaking } from "@vegaprotocol/smart-contracts-sdk";
import { useWeb3React } from "@web3-react/core";
import { NetworkConnector } from "@web3-react/network-connector";
import React from "react";

/**
 * I think this is actually going to need to export 1x ABI per bridge, i.e. around 4
 */
export const useVegaLPStaking = ({ address }: { address: string }) => {
  const { library, connector } = useWeb3React();
  return React.useMemo(() => {
    return new VegaLPStaking(
      library,
      connector instanceof NetworkConnector ? undefined : library.getSigner(),
      address
    );
  }, [library, address, connector]);
};
