import { StakingWalletsContainer } from '../staking-wallets-container';
import { DisassociatePage } from './disassociate-page';

export const DisassociateContainer = () => {
  return (
    <StakingWalletsContainer needsEthereum={true} needsVega={false}>
      {({ address, currVegaKey = null }) => (
        <DisassociatePage address={address} vegaKey={currVegaKey?.pub ?? ''} />
      )}
    </StakingWalletsContainer>
  );
};

export default DisassociateContainer;
