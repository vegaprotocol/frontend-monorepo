import { useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Icon } from '@vegaprotocol/ui-toolkit';
import { formatWithAsset } from '@vegaprotocol/liquidity';

import {
  MarketTradingModeMapping,
  MarketTradingMode,
  AuctionTrigger,
  AuctionTriggerMapping,
} from '@vegaprotocol/types';
import { HealthBar } from '../../health-bar';
import { HealthDialog } from '../../health-dialog';

import { Last24hVolume } from '../last-24h-volume';

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
  tradingMode?: MarketTradingMode;
  trigger?: AuctionTrigger;
}) => {
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);

  const getStatus = () => {
    if (!tradingMode) return '';
    if (tradingMode === MarketTradingMode.TRADING_MODE_MONITORING_AUCTION) {
      if (trigger && trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED) {
        return `${MarketTradingModeMapping[tradingMode]} - ${AuctionTriggerMapping[trigger]}`;
      }
    }
    return MarketTradingModeMapping[tradingMode];
  };

  return (
    <div>
      <div className="border border-[#d2d2d2] rounded-2xl px-2 py-6">
        <table className="w-full">
          <thead>
            <tr
              className="font-[15px] text-[#626262] text-left font-alpha"
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
              <td className="px-4">{getStatus()}</td>
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
