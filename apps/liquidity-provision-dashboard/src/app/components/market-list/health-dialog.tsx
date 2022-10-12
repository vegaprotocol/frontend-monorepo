import { t } from '@vegaprotocol/react-helpers';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { MarketTradingMode } from '@vegaprotocol/types';

import { HealthBar } from './health-bar';

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
      status: MarketTradingMode.TRADING_MODE_CONTINUOUS,
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
      status: MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
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
      status: MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
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
      <h1 className="text-xl mb-4 pr-2 font-bold" data-testid="dialog-title">
        {t('Health')}
      </h1>
      <p className="text-xl mb-4">
        {t(
          'Market health is a representation of market and liquidity status and how close that market is to moving from one fee level to another.'
        )}
      </p>

      <table className="table-fixed">
        <thead>
          <th className="w-1/2 text-left">{t('Market status')}</th>
          <th className="w-1/2 text-left">{t('Liquidity status')}</th>
        </thead>
        <tbody>
          {ROWS.map((r) => {
            return (
              <tr key={r.key}>
                <td className="pr-4 py-10">
                  <h2 className="font-bold text-base">{t(r.title)}</h2>
                  <p className="text-base">{t(r.copy)}</p>
                </td>
                <td className="py-10">
                  <HealthBar
                    size="large"
                    levels={r.data.levels}
                    status={r.data.status}
                    target={r.data.target}
                    decimals={r.data.decimals}
                    isExpanded
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
