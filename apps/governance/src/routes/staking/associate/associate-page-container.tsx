import { useEthereumConfig } from '@vegaprotocol/web3';
import { StakingWalletsContainer } from './components/staking-wallets-container';
import { AssociatePage } from './associate-page';
import { AssociatePageNoVega } from './associate-page-no-vega';
import { Heading } from '../../../components/heading';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import type { RouteChildProps } from '../../index';

export const AssociateContainer = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { config } = useEthereumConfig();

  if (!config) {
    return null;
  }

  return (
    <>
      <Heading title={t('pageTitleAssociate')} />
      <StakingWalletsContainer>
        {({ address, pubKey }) =>
          pubKey ? (
            <AssociatePage
              address={address}
              vegaKey={pubKey}
              ethereumConfig={config}
            />
          ) : (
            <AssociatePageNoVega />
          )
        }
      </StakingWalletsContainer>
    </>
  );
};

export default AssociateContainer;
