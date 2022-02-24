import { useVegaWallet } from '@vegaprotocol/react-helpers';

const Portfolio = () => {
  const { keypair } = useVegaWallet();
  return (
    <div>
      <h1>
        Portfolio for: {keypair.name} {keypair.pub}
      </h1>
    </div>
  );
};

export default Portfolio;
