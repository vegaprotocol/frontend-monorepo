import { useReferralProgram } from './hooks/use-referral-program';
import { Table } from './table';

export const TiersContainer = () => {
  const { benefitTiers } = useReferralProgram();

  return <TiersTable data={benefitTiers} />;
};

const TiersTable = ({
  data,
}: {
  data: Array<{
    tier: number;
    commission: string;
    discount: string;
    volume: string;
  }>;
}) => {
  return (
    <Table
      columns={[
        { name: 'tier', displayName: 'Tier' },
        {
          name: 'commission',
          displayName: 'Referrer commission',
          tooltip: 'A percentage of commission earned by the referrer',
        },
        { name: 'discount', displayName: 'Referrer trading discount' },
        { name: 'volume', displayName: 'Min. trading volume' },
      ]}
      data={data.map((d) => ({
        ...d,
        className:
          'from-vega-pink-400 dark:from-vega-pink-600 to-20%  bg-highlight',
      }))}
    />
  );
};
