import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';

import { EthConnectPrompt } from '../../components/eth-connect-prompt';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ConnectToVega } from './connect-to-vega';

export const StakingWalletsContainer = ({
  needsEthereum,
  needsVega,
  children,
}: {
  needsEthereum?: boolean;
  needsVega?: boolean;
  children: (data: { address: string; pubKey: string }) => React.ReactElement;
}) => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { pubKey } = useVegaWallet();

  if (!account && needsEthereum) {
    return (
      <EthConnectPrompt>
        <p>{t('associateInfo1')}</p>
        <p>{t('associateInfo2')}</p>
      </EthConnectPrompt>
    );
  }

  if (!pubKey || needsVega) {
    return (
      <>
        <EthConnectPrompt>
          <p>{t('associateInfo1')}</p>
          <p>{t('associateInfo2')}</p>
        </EthConnectPrompt>
        <ConnectToVega />
      </>
    );
  }

  return children({ address: account || '', pubKey });
};
