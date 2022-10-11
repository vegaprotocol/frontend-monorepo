import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';

import { EthConnectPrompt } from '../../../../components/eth-connect-prompt';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ConnectToVega } from '../../connect-to-vega';

export const StakingWalletsContainer = ({
  children,
}: {
  children: (data: { address: string; pubKey: string }) => React.ReactElement;
}) => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { pubKey } = useVegaWallet();

  if (!account) {
    return (
      <EthConnectPrompt>
        <p>{t('associateInfo1')}</p>
        <p>{t('associateInfo2')}</p>
      </EthConnectPrompt>
    );
  }

  if (!pubKey) {
    return <ConnectToVega />;
  }

  return children({ address: account || '', pubKey });
};
