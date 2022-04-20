import React from "react";

import { useEthereumConfig } from "../../../hooks/use-ethereum-config";
import { StakingWalletsContainer } from "../staking-wallets-container";
import { AssociatePage } from "./associate-page";
import { AssociatePageNoVega } from "./associate-page-no-vega";

export const NetworkParamsContainer = ({
  children,
}: {
  children: (data: { confirmations: number }) => React.ReactElement;
}) => {
  const config = useEthereumConfig();

  if (!config) {
    return null;
  }

  return children({
    confirmations: config.confirmations,
  });
};

export const AssociateContainer = () => {
  return (
    <NetworkParamsContainer>
      {({ confirmations }) => (
        <StakingWalletsContainer>
          {({ address, currVegaKey }) =>
            currVegaKey ? (
              <AssociatePage
                address={address}
                vegaKey={currVegaKey}
                requiredConfirmations={confirmations}
              />
            ) : (
              <AssociatePageNoVega />
            )
          }
        </StakingWalletsContainer>
      )}
    </NetworkParamsContainer>
  );
};
