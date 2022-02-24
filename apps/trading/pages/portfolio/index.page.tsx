import { useVegaWallet } from '@vegaprotocol/react-helpers';

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
    </div>
  );
};

export default Portfolio;
