import React, { useCallback } from 'react';
import { useMarketList } from '@vegaprotocol/market-list';
import { t } from '@vegaprotocol/react-helpers';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { Link as UILink } from '@vegaprotocol/ui-toolkit';
import type { Market, OnCellClickHandler } from '../select-market';
import {
  ColumnKind,
  columns,
  SelectMarketTableHeader,
  SelectMarketTableRow,
} from '../select-market';
import { WelcomeDialogHeader } from './welcome-dialog-header';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProposedMarkets } from './proposed-markets';
import { Links, Routes } from '../../pages/client-router';

export const SelectMarketLandingTable = ({
  markets,
  onClose,
}: {
  markets: Market[] | null;
  onClose: () => void;
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const marketId = params.marketId;

  const onSelect = useCallback(
    (id: string) => {
      if (id && id !== marketId) {
        navigate(Links[Routes.MARKET](id));
      }
    },
    [marketId, navigate]
  );

  const onSelectMarket = useCallback(
    (id: string) => {
      onSelect(id);
      onClose();
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
      <div
        className="max-h-[60vh] overflow-x-auto"
        data-testid="select-market-list"
      >
        <p className="text-neutral-500 dark:text-neutral-400">
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
                columns={columns(market, onSelect, onCellClick)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-md">
        <Link
          to={Links[Routes.MARKETS]()}
          data-testid="view-market-list-link"
          onClick={() => onClose()}
        >
          <UILink>{'Or view full market list'} </UILink>
        </Link>
      </div>
      {showProposed && <ProposedMarkets />}
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
