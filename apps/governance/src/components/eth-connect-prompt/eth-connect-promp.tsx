import { Button } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';

export const EthConnectPrompt = () => {
  const { t } = useTranslation();
  const { open } = useWeb3ConnectStore();
  return (
    <Button
      variant="default"
      onClick={() => open()}
      fill={true}
      data-testid="connect-to-eth-btn"
    >
      {t('connectEthWallet')}
    </Button>
  );
};
