import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';

const Portfolio = () => {
  return (
    <div className="p-24">
      <h1 className="text-h3 mb-12">{t('Portfolio')}</h1>
      <div className="flex gap-4 mb-12">
        <AnchorButton href="/portfolio/deposit">{t('Deposit')}</AnchorButton>
        <AnchorButton href="/portfolio/deposit?assetId=8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4">
          {t('Deposit tEURO')}
        </AnchorButton>
      </div>
      <div className="flex gap-4">
        <AnchorButton href="/portfolio/withdraw">{t('Withdraw')}</AnchorButton>
      </div>
    </div>
  );
};

Portfolio.getInitialProps = () => ({
  page: 'portfolio',
});

export default Portfolio;
