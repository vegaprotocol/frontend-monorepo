import React, { useCallback } from 'react';
import { useMarketList } from '@vegaprotocol/market-list';
import { t } from '@vegaprotocol/i18n';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { Link as UILink, TinyScroll } from '@vegaprotocol/ui-toolkit';
import type { OnCellClickHandler } from '../select-market';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/market-list';
import {
  ColumnKind,
  columns,
  SelectMarketTableHeader,
  SelectMarketTableRow,
} from '../select-market';
import { WelcomeDialogHeader } from './welcome-dialog-header';
import { Link } from 'react-router-dom';
import { ProposedMarkets } from './proposed-markets';
import { Links, Routes } from '../../pages/client-router';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { TelemetryApproval } from './telemetry-approval';

export const SelectMarketLandingTable = ({
  markets,
  onClose,
}: {
  markets: MarketMaybeWithDataAndCandles[] | null;
  onClose: () => void;
}) => {
  const onSelect = useMarketClickHandler();
  const onSelectMarket = useCallback(
    (id: string, metaKey?: boolean) => {
      onSelect(id, metaKey);
      if (!metaKey) {
        onClose();
      }
    },
    [onSelect, onClose]
  );
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const onCellClick = useCallback<OnCellClickHandler>(
    (e, kind, value) => {
      if (value && kind === ColumnKind.Asset) {
        openAssetDetailsDialog(value, e.target as HTMLElement);
      }
    },
    [openAssetDetailsDialog]
  );
  const showProposed = (markets?.length || 0) <= 5;
  return (
    <>
      <TinyScroll
        className="max-h-[60vh] overflow-x-auto -mr-4 pr-4"
        data-testid="select-market-list"
      >
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
          {t('Select a market to get started...')}
        </p>
        <table className="text-sm relative h-full min-w-full whitespace-nowrap">
          <thead className="sticky top-0 z-10 bg-white dark:bg-black">
            <SelectMarketTableHeader />
          </thead>
          <tbody>
            {markets?.map((market, i) => (
              <SelectMarketTableRow
                marketId={market.id}
                key={i}
                detailed={false}
                onSelect={onSelectMarket}
                columns={columns(market, onSelectMarket, onCellClick)}
              />
            ))}
          </tbody>
        </table>
      </TinyScroll>
      <div className="mt-4 text-md">
        <Link
          to={Links[Routes.MARKETS]()}
          data-testid="view-market-list-link"
          onClick={() => onClose()}
        >
          <UILink className="text-sm underline">
            {'Or view full market list'}
          </UILink>
        </Link>
      </div>
      {showProposed && <ProposedMarkets />}
      <div className="mt-4 text-md">
        <TelemetryApproval />
      </div>
    </>
  );
};

interface LandingDialogContainerProps {
  onClose: () => void;
}

export const WelcomeLandingDialog = ({
  onClose,
}: LandingDialogContainerProps) => {
  const { data, loading, error } = useMarketList();
  if (error) {
    return (
      <div className="flex justify-center items-center">
        <p className="my-8">{t('Failed to load markets')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <p className="my-8">{t('Loading...')}</p>
      </div>
    );
  }

  return (
    <>
      <WelcomeDialogHeader />
      <SelectMarketLandingTable markets={data} onClose={onClose} />
    </>
  );
};
