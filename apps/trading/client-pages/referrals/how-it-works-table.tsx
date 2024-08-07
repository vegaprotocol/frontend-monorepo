import { useT } from '../../lib/use-t';
import { Table } from '../../components/table';

export const HowItWorksTable = () => {
  const t = useT();
  return (
    <Table
      className="bg-none bg-gs-800 "
      noHeader
      noCollapse
      columns={[{ name: 'number', className: 'pr-0' }, { name: 'step' }]}
      data={[
        {
          number: <span className="text-2xl calt text-gs-100 ">1</span>,
          step: t(
            'Referrers generate a code assigned to their key via an on chain transaction'
          ),
        },
        {
          number: <span className="text-2xl calt text-gs-100 ">2</span>,
          step: t(
            'Anyone with the referral link can apply it to their key(s) of choice via an on chain transaction'
          ),
        },
        {
          number: <span className="text-2xl calt text-gs-100 ">3</span>,
          step: t(
            'Discounts are applied automatically during trading based on the key(s) used'
          ),
        },
        {
          number: <span className="text-2xl calt text-gs-100 ">4</span>,
          step: t(
            'Referrers earn commission based on a percentage of the taker fees their referees pay'
          ),
        },
        {
          number: <span className="text-2xl calt text-gs-100 ">5</span>,
          step: t(
            'The commission is taken from the infrastructure fee, maker fee, and liquidity provider fee, not from the referee'
          ),
        },
      ]}
    ></Table>
  );
};
