import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { VegaWalletContainer } from '../../../components/vega-wallet-container';
import { Web3Container } from '../../../components/web3-container';
import { WithdrawalsPageContainer } from './withdrawals-page-container';

const Withdrawals = () => {
  return (
    <VegaWalletContainer>
      <Web3Container>
        <div className="h-full grid grid grid-rows-[min-content,1fr]">
          <header className="flex justify-between p-24">
            <h1 className="text-h3">{t('Withdrawals')}</h1>
            <AnchorButton href="/portfolio/withdraw">
              {t('Start withdrawal')}
            </AnchorButton>
          </header>
          <WithdrawalsPageContainer />
        </div>
      </Web3Container>
    </VegaWalletContainer>
  );
};

export default Withdrawals;
