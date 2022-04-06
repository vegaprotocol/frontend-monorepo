import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';

const Portfolio = () => {
  const { keypair } = useVegaWallet();
  return (
    <div>
      <h1>{t('Portfolio')}</h1>
      {keypair && <p>{t(`Keypair: ${keypair.name} ${keypair.pub}`)}</p>}
      <div className="flex gap-4">
        <AnchorButton href="/portfolio/deposit">{t('Deposit')}</AnchorButton>
        <AnchorButton href="/portfolio/deposit?assetId=8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4">
          {t('Deposit tEURO')}
        </AnchorButton>
      </div>
    </div>
  );
};

export default Portfolio;
