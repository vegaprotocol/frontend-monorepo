import { t } from '@vegaprotocol/i18n';
import { Dialog, HealthBar } from '@vegaprotocol/ui-toolkit';
import * as Schema from '@vegaprotocol/types';
import classNames from 'classnames';
import { intentForStatus } from '../../lib/utils';

interface HealthDialogProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
}

const ROWS = [
  {
    key: '1',
    title: 'Continuous',
    copy: 'Markets that have committed liquidity equal or greater than the target stake are trading continuously.',
    data: {
      status: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
      target: '171320',
      decimals: 5,
      levels: [
        { fee: '0.6', commitmentAmount: 150000 },
        { fee: '1', commitmentAmount: 150000 },
        { fee: '2', commitmentAmount: 30000 },
      ],
    },
  },
  {
    key: '2',
    title: 'Monitoring auction (liquidity)',
    copy: 'Markets below the target stake will see trading suspended and go into liquidity auction.',
    data: {
      status: Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      target: '171320',
      decimals: 5,
      levels: [
        { fee: '0.6', commitmentAmount: 110000 },
        { fee: '1', commitmentAmount: 50000 },
      ],
    },
  },
  {
    key: '3',
    title: 'Opening auction',
    copy: 'A newly created market looking for a target liquidity amount to start trading.',
    data: {
      status: Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
      target: '171320',
      decimals: 3,
      levels: [
        { fee: '0.6', commitmentAmount: 110000 },
        { fee: '1', commitmentAmount: 50000 },
      ],
    },
  },
];

export const HealthDialog = ({ onChange, isOpen }: HealthDialogProps) => {
  return (
    <Dialog size="medium" open={isOpen} onChange={onChange}>
      <h1 className="text-2xl mb-5 pr-2 font-medium font-alpha uppercase">
        {t('Health')}
      </h1>
      <p className="text-lg font-medium font-alpha mb-8">
        {t(
          'Market health is a representation of market and liquidity status and how close that market is to moving from one fee level to another.'
        )}
      </p>

      <table className="table-fixed">
        <thead className="border-b border-greys-light-300">
          <th className="w-1/2 text-left font-medium font-alpha text-base pb-4 uppercase">
            {t('Market status')}
          </th>
          <th className="w-1/2 text-lef font-medium font-alpha text-base pb-4 uppercase">
            {t('Liquidity status')}
          </th>
        </thead>
        <tbody>
          {ROWS.map((r, index) => {
            const isFirstRow = index === 0;
            return (
              <tr key={r.key}>
                <td
                  className={classNames('pr-4 pb-10', { 'pt-8': isFirstRow })}
                >
                  <h2 className="font-medium font-alpha uppercase text-base">
                    {t(r.title)}
                  </h2>
                  <p className="font-medium font-alpha text-lg">{t(r.copy)}</p>
                </td>
                <td
                  className={classNames('pl-4 pb-10', { 'pt-8': isFirstRow })}
                >
                  <HealthBar
                    size="large"
                    levels={r.data.levels}
                    target={r.data.target}
                    decimals={r.data.decimals}
                    intent={intentForStatus(r.data.status)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Dialog>
  );
};
