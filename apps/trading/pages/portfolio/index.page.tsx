import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';

const Portfolio = () => {
  return (
    <div className="p-24">
      <h1 className="text-h3 mb-12">{t('Portfolio')}</h1>
      <div className="flex gap-4 mb-12">
        <AnchorButton data-testid="deposit" href="/portfolio/deposit">
          {t('Deposit')}
        </AnchorButton>
        <AnchorButton
          data-testid="deposit-tEuro"
          href="/portfolio/deposit?assetId=8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4"
        >
          {t('Deposit tEURO')}
        </AnchorButton>
      </div>
      <div className="flex gap-4">
        <AnchorButton
          data-testid="view-withdrawals"
          href="/portfolio/withdrawals"
        >
          {t('View Withdrawals')}
        </AnchorButton>
        <AnchorButton data-testid="withdraw" href="/portfolio/withdraw">
          {t('Withdraw')}
        </AnchorButton>
        <AnchorButton
          data-testid="withdraw-tEuro"
          href="/portfolio/withdraw?assetId=8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4"
        >
          {t('Withdraw tEURO')}
        </AnchorButton>
      </div>
    </div>
  );
};

Portfolio.getInitialProps = () => ({
  page: 'portfolio',
});

export default Portfolio;
