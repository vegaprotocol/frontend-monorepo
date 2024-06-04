import { useState } from 'react';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TradingInput,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useChainId } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import classNames from 'classnames';

export const AssetInput = ({
  label,
  amount,
  asset,
  balance,
  accountAssetIds,
  assets,
  onAmountChange,
  onAssetChange,
  accountWarning = true,
  pubKey,
}: {
  label: string;
  amount: string;
  asset?: AssetFieldsFragment;
  balance?: string;
  accountAssetIds?: string[];
  assets?: Record<string, AssetFieldsFragment> | null;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAssetChange: (asset: AssetFieldsFragment) => void;
  accountWarning?: boolean;
  pubKey?: string;
}) => {
  const t = useT();

  return (
    <div className="dark:bg-vega-cdark-700 bg-vega-clight-700 p-4 rounded-lg border-gray-700 border flex flex-col gap-1">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <input
          value={amount}
          onChange={(e) => {
            onAmountChange(e);
          }}
          className="w-[140px] dark:bg-vega-cdark-800 bg-vega-clight-500 p-2 rounded-lg mr-2 text-center"
        />
        <DropdownAsset
          assetId={asset?.id}
          onSelect={onAssetChange}
          assets={assets}
        />
      </div>
      <div className="flex justify-between items-center text-gray-500 text-sm">
        <span>{/* {quoteAmount && `$${quoteAmount}`} */}</span>
        {accountWarning &&
        accountAssetIds &&
        !!pubKey &&
        asset &&
        !accountAssetIds.includes(asset.id) ? (
          <span className="text-xs">
            {t(`You do not have this asset in your account`)}
          </span>
        ) : (
          <span>
            {balance !== undefined &&
              asset !== undefined &&
              t('Balance: {{balance}}', {
                balance: addDecimalsFormatNumber(balance, asset.decimals),
              })}
          </span>
        )}
      </div>
    </div>
  );
};

export const SwapButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    className="flex justify-center p-2 w-fit rounded-full bg-vega-clight-700 dark:bg-black self-center -my-5 z-10 hover:bg-vega-clight-800 hover:dark:bg-vega-cdark-800 border-gray-400 border"
    onClick={onClick}
  >
    <VegaIcon name={VegaIconNames.SWAP} size={18} />
  </button>
);

export const PriceImpactInput = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const t = useT();
  const [, setPriceImpactType] = useState<'custom' | 'auto'>('custom');
  const autoValues = ['0.1', '0.5', '1.0'];

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 mt-2 text-gray-500 text-sm">
        <span>{t('Price impact tolerance')}</span>
      </div>
      <div className="flex items-center">
        <span className="w-16 h-10 rounded-lg mr-2 text-center text-md">
          {value || ''} %
        </span>
      </div>
      <div className="flex items-center flex-wrap">
        {autoValues.map((val) => (
          <button
            key={val}
            type="button"
            value={value}
            onClick={() => {
              onValueChange(val);
              setPriceImpactType('auto');
            }}
            className={classNames(
              'h-8 text-md dark:bg-vega-cdark-500 bg-vega-clight-500 px-2 rounded-lg mr-2 text-center text-sm',
              {
                'dark:bg-vega-cdark-700 bg-vega-clight-700': val === value,
              }
            )}
          >
            {val} %
          </button>
        ))}

        <div className="flex flex-1">
          <p className="pt-2 pr-2 text-sm">{t('Custom')}: </p>
          <TradingInput
            type="number"
            value={value}
            onChange={(e) => {
              onValueChange(e.target.value);
              setPriceImpactType('custom');
            }}
            appendElement="%"
            className="h-10 text-md dark:bg-vega-cdark-800 bg-vega-clight-500 p-2 rounded-lg mr-2 text-center"
          />
        </div>
      </div>
    </div>
  );
};

export const DropdownAsset = ({
  assetId,
  onSelect,
  assets,
}: {
  assetId?: string;
  onSelect: (asset: AssetFieldsFragment) => void;
  assets?: Record<string, AssetFieldsFragment> | null;
}) => {
  const { chainId } = useChainId();
  const asset = assetId ? assets?.[assetId] : null;
  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger
          asChild
          className="flex items-center px-2 py-2 border-gray-400 border rounded-full h-12"
        >
          {asset && <EmblemByAsset asset={asset.id} vegaChain={chainId} />}
          <span className="pl-2">{asset ? asset.symbol : 'Select coin'}</span>
          <VegaIcon
            name={VegaIconNames.CHEVRON_DOWN}
            size={14}
            className="w-5 h-5 ml-2 flex items-center justify-center"
          />
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent className="bg-gray-700 rounded-md mt-2">
        {assets &&
          Object.values(assets).map((asset) => (
            <DropdownMenuItem
              onClick={() => {
                onSelect(asset);
              }}
              key={asset.id}
              className="px-4 py-2 dark:text-gray-200 hover:bg-gray-600 flex items-center"
            >
              <EmblemByAsset asset={asset.id} vegaChain={chainId} />
              {asset.symbol}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
