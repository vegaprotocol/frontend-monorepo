import { StakingWalletsContainer } from '../staking-wallets-container';
import { DisassociatePage } from './disassociate-page';

export const DisassociateContainer = () => {
  return (
    <StakingWalletsContainer needsEthereum={true} needsVega={false}>
      {({ address, pubKey }) => (
        <DisassociatePage address={address} vegaKey={pubKey ?? ''} />
      )}
    </StakingWalletsContainer>
  );
};

export default DisassociateContainer;
