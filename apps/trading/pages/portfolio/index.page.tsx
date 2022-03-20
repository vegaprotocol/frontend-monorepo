import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';

const Portfolio = () => {
  const { keypair } = useVegaWallet();
  return (
    <div>
      <h1>Portfolio</h1>
      {keypair && (
        <p>
          Keypair: {keypair.name} {keypair.pub}
        </p>
      )}
      <div className="flex gap-4">
        <AnchorButton href="/portfolio/deposit">Deposit</AnchorButton>
      </div>
    </div>
  );
};

export default Portfolio;
