import "./disassociate-page.scss";

import { StakingWalletsContainer } from "../staking-wallets-container";
import { DisassociatePage } from "./disassociate-page";
import { DisassociatePageNoVega } from "./disassociate-page-no-vega";

export const DisassociateContainer = () => {
  return (
    <StakingWalletsContainer needsEthereum={true} needsVega={false}>
      {({ address, currVegaKey = null }) => (
        currVegaKey
        ? <DisassociatePage address={address} vegaKey={currVegaKey} />
        : <DisassociatePageNoVega />
      )}
    </StakingWalletsContainer>
  );
};
