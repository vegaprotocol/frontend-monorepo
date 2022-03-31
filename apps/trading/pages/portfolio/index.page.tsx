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
      </div>
    </div>
  );
};

export default Portfolio;
