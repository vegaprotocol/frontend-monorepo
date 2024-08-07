import type { vegaAccount } from '@vegaprotocol/rest-clients/dist/trading-data';
import {
  addDecimalsFormatNumber,
  formatNumber,
  toBigNum,
} from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import get from 'lodash/get';

import { CollapsibleCard } from '@/components/collapsible-card';
import { DataTable } from '@/components/data-table';
import { ACCOUNT_TYPE_MAP, processAccountType } from '@/lib/enums';
import { useAssetsStore } from '@/stores/assets-store';

import { MarketLozenges } from './markets-lozenges';

export const locators = {
  assetCard: 'asset-card',
  assetHeaderSymbol: 'asset-header-symbol',
  assetHeaderName: 'asset-header-name',
  assetHeaderTotal: 'asset-header-total',
};

const AssetHeader = ({
  symbol,
  name,
  accounts,
  decimals,
}: {
  symbol: string;
  name: string;
  accounts: vegaAccount[];
  decimals: number;
}) => {
  const total = accounts.reduce(
    (accumulator, { balance }) =>
      accumulator.plus(toBigNum(balance ?? '0', decimals)),
    new BigNumber(0)
  );
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-left">
        <div data-testid={locators.assetHeaderSymbol} className="text-white">
          {symbol}
        </div>
        <div data-testid={locators.assetHeaderName} className="text-sm">
          {name}
        </div>
      </div>
      <div
        data-testid={locators.assetHeaderTotal}
        className="text-right text-white"
      >
        {formatNumber(total, decimals)}
      </div>
    </div>
  );
};

export const AssetCard = ({
  accounts,
  assetId,
  allowZeroAccounts = false,
}: {
  accounts: vegaAccount[];
  assetId: string;
  allowZeroAccounts?: boolean;
}) => {
  const { getAssetById } = useAssetsStore((state) => ({
    getAssetById: state.getAssetById,
  }));
  const asset = getAssetById(assetId);
  const symbol = get(asset, 'details.symbol');
  const name = get(asset, 'details.name');
  const decimals = get(asset, 'details.decimals');

  if (!decimals || !symbol || !name) {
    throw new Error('Asset details not populated');
  }
  const filteredAccounts = accounts
    .filter(
      (a) =>
        allowZeroAccounts ||
        (!!a.balance && toBigNum(a.balance, +decimals).gt(0))
    )
    .map((a) => {
      const accountType = a.type
        ? ACCOUNT_TYPE_MAP[processAccountType(a.type)]
        : 'Unknown';
      return [accountType, addDecimalsFormatNumber(a.balance ?? 0, +decimals)];
    }) as [string, string][];
  return (
    <div
      data-testid={locators.assetCard}
      className="border border-vega-dark-150 mb-4"
    >
      <CollapsibleCard
        title={
          <AssetHeader
            symbol={symbol}
            name={name}
            decimals={+decimals}
            accounts={accounts}
          />
        }
        cardContent={
          <div className="overflow-hidden">
            <DataTable items={filteredAccounts} />
            <MarketLozenges assetId={assetId} />
          </div>
        }
      />
    </div>
  );
};
