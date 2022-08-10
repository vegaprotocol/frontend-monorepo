import { useEthereumConfig } from '@vegaprotocol/web3';
import { StakingWalletsContainer } from '../staking-wallets-container';
import { AssociatePage } from './associate-page';
import { AssociatePageNoVega } from './associate-page-no-vega';

export const AssociateContainer = () => {
  const { config } = useEthereumConfig();

  if (!config) {
    return null;
  }

  return (
    <StakingWalletsContainer>
      {({ address, currVegaKey }) =>
        currVegaKey ? (
          <AssociatePage
            address={address}
            vegaKey={currVegaKey}
            ethereumConfig={config}
          />
        ) : (
          <AssociatePageNoVega />
        )
      }
    </StakingWalletsContainer>
  );
};

export default AssociateContainer;
