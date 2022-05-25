import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Web3Container } from '../../../components/web3-container';
import { WithdrawalsContainer } from './withdrawals-container';

const Withdrawals = () => {
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <Web3Container
      render={() => (
        <div className="h-full grid grid grid-rows-[min-content,1fr]">
          <header className="flex justify-between p-24">
            <h1 className="text-h3">{t('Withdrawals')}</h1>
            <AnchorButton href="/portfolio/withdraw">
              {t('Start withdrawal')}
            </AnchorButton>
          </header>
          <WithdrawalsContainer />
        </div>
      )}
    />
  );
};

export default Withdrawals;
