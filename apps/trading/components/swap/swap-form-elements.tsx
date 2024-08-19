import { type ChangeEvent, useRef } from 'react';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Intent,
  Button,
  TradingInput,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useChainId } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import { cn } from '@vegaprotocol/ui-toolkit';

export const AssetInput = ({
  label,
  amount,
  asset,
  balance = '0',
  assets,
  onAmountChange,
  onAssetChange,
  testId,
  step,
}: {
  label: string;
  amount: string;
  asset?: AssetFieldsFragment;
  balance?: string;
  assets: AssetFieldsFragment[];
  onAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAssetChange: (asset: AssetFieldsFragment) => void;
  testId: string;
  step?: string;
}) => {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputName = `${testId}-amount`;

  return (
    <div
      className="focus-within:bg-surface-3 bg-surface-2 py-2 px-4 rounded-lg border-gs-300 dark:border-gs-700 border flex flex-col gap-1 cursor-pointer"
      data-testid={testId}
      role="button"
      // No need for tabindex as the input can be tabbed to
      tabIndex={-1}
      onClick={() => inputRef.current?.focus()}
      onKeyUp={(e) => e.code === 'Enter' && inputRef.current?.focus()}
    >
      <label htmlFor={inputName} className="text-sm text-surface-0-fg-muted">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="flex-grow">
          <input
            name={inputName}
            type="number"
            ref={inputRef}
            value={amount}
            onChange={(e) => {
              onAmountChange(e);
            }}
            className="w-full bg-transparent py-2 focus:outline-none text-4xl cursor-pointer"
            data-testid={`${testId}-amount-input`}
          />
        </div>
        <DropdownAsset
          assetId={asset?.id}
          onSelect={onAssetChange}
          assets={assets}
          testId={`${testId}-dropdown`}
        />
      </div>
      <div className="flex justify-end items-center text-surface-0-fg-muted text-sm pb-1">
        {step && amount && amount < step ? (
          <span className="text-warning pb-1">
            {t('Amount cannot be lower than {{step}}', { step })}
          </span>
        ) : (
          <span>
            {asset !== undefined &&
              balance !== undefined &&
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
    className="flex justify-center p-2 w-fit rounded-full bg-surface-2 self-center -my-5 z-10 hover:bg-surface-1 hover: border-gs-300 dark:border-gs-700 border"
    onClick={onClick}
    data-testid="swap-button"
  >
    <VegaIcon name={VegaIconNames.SWAP} size={18} />
  </button>
);

export const PriceImpactInput = ({
  value,
  onValueChange,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const t = useT();
  const autoValues = ['0.1', '0.5', '1.0'];

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="price-tolerance"
        className="text-surface-0-fg-muted text-sm"
      >
        {t('Price impact tolerance')}
      </label>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-grow min-w-[80px]">
          <TradingInput
            name="custom-price-tolerance"
            type="number"
            disabled={disabled}
            value={value}
            min={0}
            max={99}
            step={0.1}
            onChange={(e) => {
              const valueNum = Number(e.target.value);

              if (valueNum < 0) return;
              if (valueNum > 100) return;

              onValueChange(e.target.value);
            }}
            appendElement="%"
            data-testid="custom-price-impact-input"
          />
        </div>
        <div className="flex justify-end">
          {autoValues.map((val) => (
            <Button
              intent={Intent.None}
              disabled={disabled}
              size="sm"
              className={cn('mr-2', {
                ' bg-surface-2': val === value,
              })}
              key={val}
              type="button"
              value={value}
              onClick={() => {
                onValueChange(val);
              }}
              data-testid={`auto-value-${val}`}
            >
              {val}%
            </Button>
          ))}
        </div>
        {Number(value) >= 100 && (
          <span className="text-warning text-xs">
            {t('Price impact tolerance must be between 0% and 100%')}
          </span>
        )}
      </div>
    </div>
  );
};

export const DropdownAsset = ({
  assetId,
  onSelect,
  assets,
  testId,
}: {
  assetId?: string;
  onSelect: (asset: AssetFieldsFragment) => void;
  assets: AssetFieldsFragment[];
  testId: string;
}) => {
  const t = useT();
  const { chainId } = useChainId();
  const asset = assetId ? assets.find((a) => a.id === assetId) : null;
  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger asChild>
          <button
            className="flex text-sm gap-4 items-center py-2 pl-2 pr-4 border border-gs-300 dark:border-gs-700 rounded-full h-12"
            data-testid={`${testId}-trigger`}
          >
            {asset ? (
              <span className="flex items-center gap-2">
                <span className="w-8 h-8">
                  <EmblemByAsset asset={asset.id} vegaChain={chainId} />
                </span>
                <span>{asset.symbol}</span>
              </span>
            ) : (
              <span className="pl-3 whitespace-nowrap">
                {t('Select asset')}
              </span>
            )}
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
          </button>
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent
        data-testid={`${testId}-dropdown-content`}
        align="end"
      >
        {assets.map((asset) => (
          <DropdownMenuItem
            onClick={() => {
              onSelect(asset);
            }}
            key={asset.id}
            data-testid={`${testId}-asset-${asset.id}`}
          >
            <EmblemByAsset asset={asset.id} vegaChain={chainId} />
            {asset.symbol}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
