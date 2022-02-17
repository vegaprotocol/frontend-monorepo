import { useRouter } from 'next/router';

const MarketPage = () => {
  const router = useRouter();
  return (
    <div>
      <h1>Market: {router.query.marketId}</h1>
    </div>
  );
};

export default MarketPage;
