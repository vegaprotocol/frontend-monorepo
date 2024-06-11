import { type ChangeEvent, useRef } from 'react';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Intent,
  TradingButton,
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
      className="dark:focus-within:bg-vega-cdark-800 focus-within:bg-vega-clight-800 dark:bg-vega-cdark-700 bg-vega-clight-700 py-2 px-4 rounded-lg border-gray-700 border flex flex-col gap-1 cursor-pointer"
      data-testid={testId}
      role="button"
      // No need for tabindex as the input can be tabbed to
      tabIndex={-1}
      onClick={() => inputRef.current?.focus()}
      onKeyUp={(e) => e.code === 'Enter' && inputRef.current?.focus()}
    >
      <label htmlFor={inputName} className="text-sm text-secondary">
        {label}
      </label>
      <div className="flex items-center gap-px">
        <div className="flex-grow">
          <input
            name={inputName}
            type="number"
            ref={inputRef}
            value={amount}
            onChange={(e) => {
              onAmountChange(e);
            }}
            className="w-full bg-transparent p-2 focus:outline-none text-4xl cursor-pointer"
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
      <div className="flex justify-end items-center text-secondary text-sm">
        {step && amount && amount < step ? (
          <span className="text-warning pb-1">
            {t('Amount cannot be lower than {{step}}', { step })}
          </span>
        ) : (
          <span>
            {asset !== undefined &&
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
      <label htmlFor="price-tolerance" className="text-secondary text-sm">
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
            max={100}
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
            <TradingButton
              intent={Intent.None}
              disabled={disabled}
              size="small"
              className={classNames('mr-2', {
                'dark:bg-vega-cdark-700 bg-vega-clight-700': val === value,
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
            </TradingButton>
          ))}
        </div>
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
        <DropdownMenuTrigger
          asChild
          className="flex items-center py-2 px-4 border rounded-full h-12 text-lg"
          data-testid={`${testId}-trigger`}
        >
          {asset ? (
            <span className="flex items-center gap-2 -ml-2">
              <span className="w-8 h-8">
                <EmblemByAsset asset={asset.id} vegaChain={chainId} />
              </span>
              <span>{asset.symbol}</span>
            </span>
          ) : (
            <span>{t('Select asset')}</span>
          )}
          <VegaIcon
            name={VegaIconNames.CHEVRON_DOWN}
            size={14}
            className="w-5 h-5 ml-4 flex items-center justify-center"
          />
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent data-testid={`${testId}-dropdown-content`}>
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
