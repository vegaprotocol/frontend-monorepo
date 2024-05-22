import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useAssetsMapProvider,
  type AssetFieldsFragment,
} from '@vegaprotocol/assets';
import {
  getBaseAsset,
  getQuoteAsset,
  isSpot,
  useMarketsMapProvider,
  type MarketMap,
} from '@vegaprotocol/markets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  VegaIcon,
  VegaIconNames,
  Link,
} from '@vegaprotocol/ui-toolkit';
import { EmblemByAsset, EmblemByMarket } from '@vegaprotocol/emblem';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useAccounts } from '@vegaprotocol/accounts';
import { useT } from '../../lib/use-t';

const chooseMarket = (
  markets: MarketMap | null,
  baseAsset: AssetFieldsFragment,
  quoteAsset: AssetFieldsFragment
) => {
  if (!markets) return;
  const market = Object.values(markets)?.find((m) => {
    if (!isSpot(m.tradableInstrument.instrument.product)) {
      return false;
    }
    const mBaseAsset = getBaseAsset(m);
    const mQuoteAsset = getQuoteAsset(m);
    return mBaseAsset.id === baseAsset.id && mQuoteAsset.id === quoteAsset.id;
  });
  return market;
};

export interface SwapFields {
  baseId: string;
  quoteId: string;
  baseAmount: string;
  quoteAmount: string;
  priceImpactTolerance: string;
}

export const SwapContainer = () => {
  const t = useT();
  const { watch, setValue } = useForm<SwapFields>();

  const { baseAmount, quoteAmount } = watch();

  const { pubKey } = useVegaWallet();
  const { data: accounts } = useAccounts(pubKey);
  const { data: markets } = useMarketsMapProvider();

  const [quoteAsset, setQuoteAsset] = useState<AssetFieldsFragment>();
  const [baseAsset, setBaseAsset] = useState<AssetFieldsFragment>();
  const [marketId, setMarketId] = useState<string>(markets?.[0]?.id || '');

  // TODO get balance from wallet
  const quoteAssetBalance = 0.797;
  const baseAssetBalance = 82.0;

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setBaseAsset(accounts[0].asset);
      setQuoteAsset(accounts[1].asset);
    }
    // Set marketId based on base and quote assets
    const market =
      baseAsset && quoteAsset && chooseMarket(markets, baseAsset, quoteAsset);
    if (market) {
      setMarketId(market.id);
    }
  }, [accounts, baseAsset, markets, quoteAsset]);

  const switchAssets = () => {
    const newBaseAsset = quoteAsset;
    const newQuoteAsset = baseAsset;
    setBaseAsset(newBaseAsset);
    setQuoteAsset(newQuoteAsset);
    newBaseAsset &&
      newQuoteAsset &&
      chooseMarket(markets, newBaseAsset, newQuoteAsset);

    // switch amounts
    const newBaseAmount = quoteAmount;
    const newQuoteAmount = baseAmount;
    setValue('baseAmount', newBaseAmount);
    setValue('quoteAmount', newQuoteAmount);
  };

  return (
    <div className="max-w-md mx-auto p-5 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1>{t('Swap')}</h1>
        <Link
          href={`/#/markets/${marketId}`}
          className="text-sm text-vega-cdark-400"
        >
          {marketId && <EmblemByMarket market={marketId} />}
          {t('Go to market')} <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
        </Link>
      </div>

      <div className="flex flex-col w-full gap-2">
        {/* Quote Asset dropdown */}
        <div className="dark:bg-vega-cdark-700 bg-vega-clight-700 p-4 rounded-lg border-gray-400 border">
          <div className="flex justify-between items-center mb-2">
            <span>{t('You receive')}</span>
            <span>
              {t('Balance: {{balance}}', {
                balance: quoteAssetBalance,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={quoteAmount}
              onChange={(e) => {
                setValue('quoteAmount', e.target.value);
              }}
              className="w-24 dark:bg-vega-cdark-800 bg-vega-clight-800 p-2 rounded-lg mr-2 text-center "
            />
            <DropdownAsset assetId={quoteAsset?.id} onSelect={setQuoteAsset} />
          </div>
          <span className="text-left">{quoteAmount && `$${quoteAmount}`}</span>
        </div>

        {/* Swap icon */}
        <button
          className="flex justify-center p-2 w-fit rounded-full bg-vega-clight-700 dark:bg-black self-center -my-5 z-10 hover:bg-vega-clight-800 hover:dark:bg-vega-cdark-800 border-gray-400 border"
          onClick={() => {
            switchAssets();
          }}
        >
          <VegaIcon name={VegaIconNames.SWAP} size={18} />
        </button>

        {/* Base Asset dropdown */}
        <div className="dark:bg-vega-cdark-700 bg-vega-clight-700 p-4 rounded-lg border-gray-400 border">
          <div className="flex justify-between items-center mb-2">
            <span>{t('You pay')}</span>
            <span className="text-right">
              {t('Balance: {{balance}}', {
                balance: baseAssetBalance,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              onChange={(e) => {
                setValue('baseAmount', e.target.value);
              }}
              value={baseAmount}
              className="w-24 dark:bg-vega-cdark-800 bg-vega-clight-800 p-2 rounded-lg mr-2 text-center text-xxl"
            />
            <DropdownAsset assetId={baseAsset?.id} onSelect={setBaseAsset} />
          </div>
          <span className="text-left">{baseAmount && `$${baseAmount}`}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2 mt-2">
          <span>{t('Price impact tolerance')}</span>
        </div>
        <div className="flex items-center">
          <input
            type="number"
            value="0.5"
            className="w-16 dark:bg-vega-cdark-800 bg-vega-clight-800 p-2 rounded-lg mr-2 text-center"
          />
          <span>%</span>
          <button className="ml-4 dark:bg-vega-cdark-700 bg-vega-clight-700 p-2 rounded-lg">
            {t('AUTO')}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full dark:bg-vega-cdark-700 bg-vega-clight-700 hover:bg-vega-clight-800 hover:dark:bg-vega-cdark-800 p-4 rounded-lg "
      >
        {t('Swap now')}
      </button>

      {/* TODO calculate notional and estimations */}
      <div className="mt-4 text-center dark:text-vega-cdark-400 text-vega-clight-400">
        1 ETH = 3,116.84 USDC ($3,100.48)
      </div>
    </div>
  );
};

const DropdownAsset = ({
  assetId,
  onSelect,
}: {
  assetId?: string;
  onSelect: (asset: AssetFieldsFragment) => void;
}) => {
  const { data: assets } = useAssetsMapProvider();
  const asset = assetId ? assets?.[assetId] : null;
  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center px-4 py-2 border-gray-400 border rounded-full">
            {asset && <EmblemByAsset asset={asset.id} />}
            <span className="pl-2">{asset ? asset.symbol : 'Select coin'}</span>
            <VegaIcon
              name={VegaIconNames.CHEVRON_DOWN}
              size={14}
              className="w-5 h-5 ml-2"
            />
          </button>
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent className="bg-gray-700 rounded-md mt-2">
        {assets &&
          Object.values(assets).map((asset) => (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(asset);
              }}
              key={asset.id}
              className="px-4 py-2 dark:text-gray-200 hover:bg-gray-600 flex items-center"
            >
              <EmblemByAsset asset={asset.id} />
              {asset.symbol}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
