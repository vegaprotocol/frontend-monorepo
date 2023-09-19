import { Table } from './table';

export const HowItWorksTable = () => (
  <Table
    className="bg-none bg-vega-clight-800 dark:bg-vega-cdark-800"
    noHeader
    noCollapse
    columns={[{ name: 'number', className: 'pr-0' }, { name: 'step' }]}
    data={[
      {
        number: (
          <span className="text-2xl calt text-vega-clight-100 dark:text-vega-cdark-100">
            1
          </span>
        ),
        step: 'Referrers generate a code assigned to their key via an on chain transaction',
      },
      {
        number: (
          <span className="text-2xl calt text-vega-clight-100 dark:text-vega-cdark-100">
            2
          </span>
        ),
        step: 'Anyone with the referral link can apply it to their key(s) of choice via an on chain transaction',
      },
      {
        number: (
          <span className="text-2xl calt text-vega-clight-100 dark:text-vega-cdark-100">
            3
          </span>
        ),
        step: 'Discounts are applied automatically during trading based on the key(s) used',
      },
      {
        number: (
          <span className="text-2xl calt text-vega-clight-100 dark:text-vega-cdark-100">
            4
          </span>
        ),
        step: 'Referrers earn commission based on a percentage of the taker fees their referees pay',
      },
      {
        number: (
          <span className="text-2xl calt text-vega-clight-100 dark:text-vega-cdark-100">
            5
          </span>
        ),
        step: 'The commission is taken from the infrastructure fee, maker fee, and liquidity provider fee, not from the referee',
      },
    ]}
  ></Table>
);
