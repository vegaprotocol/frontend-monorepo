import { useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Icon } from '@vegaprotocol/ui-toolkit';
import { formatWithAsset } from '@vegaprotocol/liquidity';

import type * as Schema from '@vegaprotocol/types';
import { HealthBar } from '../../health-bar';
import { HealthDialog } from '../../health-dialog';
import { Last24hVolume } from '../last-24h-volume';
import { Status } from '../../status';

interface Levels {
  fee: string;
  commitmentAmount: number;
}

interface settlementAsset {
  symbol?: string;
  decimals?: number;
}

export const Market = ({
  marketId,
  feeLevels,
  comittedLiquidity,
  settlementAsset,
  targetStake,
  tradingMode,
  trigger,
}: {
  marketId: string;
  feeLevels: Levels[];
  comittedLiquidity: number;
  targetStake: string;
  settlementAsset?: settlementAsset;
  tradingMode?: Schema.MarketTradingMode;
  trigger?: Schema.AuctionTrigger;
}) => {
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);

  return (
    <div>
      <div className="border border-greys-light-200 rounded-2xl px-2 py-6">
        <table className="w-full">
          <thead>
            <tr
              className="text-sm text-greys-light-400 text-left font-alpha calt"
              style={{ fontFeatureSettings: "'liga' off, 'calt' off" }}
            >
              <th className="font-medium px-4">{t('Volume (24h)')}</th>
              <th className="font-medium px-4">{t('Commited Liquidity')}</th>
              <th className="font-medium px-4">{t('Status')}</th>
              <th className="font-medium flex items-center px-4">
                <span>{t('Health')}</span>{' '}
                <button
                  onClick={() => setIsHealthDialogOpen(true)}
                  aria-label={t('open tooltip')}
                  className="flex ml-1"
                >
                  <Icon name="info-sign" />
                </button>
              </th>
              <th className="font-medium">{t('Est. APY')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4">
                <div>
                  {marketId && settlementAsset?.decimals && (
                    <Last24hVolume
                      marketId={marketId}
                      decimals={settlementAsset.decimals}
                    />
                  )}
                </div>
              </td>
              <td className="px-4">
                <span className="text-3xl">
                  {comittedLiquidity && settlementAsset
                    ? formatWithAsset(`${comittedLiquidity}`, settlementAsset)
                    : '0'}
                </span>
              </td>
              <td className="px-4">
                <Status
                  trigger={trigger}
                  tradingMode={tradingMode}
                  size="large"
                />
              </td>
              <td className="px-4">
                {tradingMode && settlementAsset?.decimals && feeLevels && (
                  <HealthBar
                    status={tradingMode}
                    target={targetStake}
                    decimals={settlementAsset.decimals}
                    levels={feeLevels}
                  />
                )}
              </td>
              <td className="px-4">
                <span className="text-3xl"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <HealthDialog
        isOpen={isHealthDialogOpen}
        onChange={() => {
          setIsHealthDialogOpen(!isHealthDialogOpen);
        }}
      />
    </div>
  );
};
