import { Table } from './table';

export const TiersTable = () => (
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
    data={[
      {
        tier: '1',
        commission: '1.0%',
        discount: '1.0%',
        volume: '€30,000',
        className:
          'from-vega-pink-400 dark:from-vega-pink-600 to-20%  bg-highlight',
      },
      {
        tier: '2',
        commission: '0.5%',
        discount: '0.5%',
        volume: '€20,000',
        className:
          'from-vega-purple-400 dark:from-vega-purple-600 to-20%  bg-highlight',
      },
      {
        tier: '3',
        commission: '0.1%',
        discount: '0.1%',
        volume: '€10,000',
        className:
          'from-vega-blue-400 dark:from-vega-blue-600 to-20%  bg-highlight',
      },
    ]}
  ></Table>
);
