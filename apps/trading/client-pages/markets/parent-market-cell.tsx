import { useMarketsMapProvider } from '@vegaprotocol/markets';

export const ParentMarketCell = ({
  value,
}: {
  value: string; // parentMarketId
}) => {
  const { data, loading } = useMarketsMapProvider();

  if (loading) return null;

  if (!data || !data[value]) return <span>-</span>;

  return <div>{data[value].tradableInstrument.instrument.code}</div>;
};
