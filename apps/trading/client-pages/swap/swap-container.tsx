import { useEffect, useMemo, useState } from 'react';
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
  type MarketFieldsFragment,
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
import { useAccounts, type Account } from '@vegaprotocol/accounts';
import { useT } from '../../lib/use-t';
import { addDecimalsFormatNumber, formatNumber } from '@vegaprotocol/utils';

const assetBalance = (
  asset?: AssetFieldsFragment,
  accounts?: Account[] | null
) => {
  if (!asset || !accounts) return undefined;
  const account = accounts.find((a) => a.asset.id === asset.id);
  if (account) {
    return account.balance;
  }
  return undefined;
};

const chooseMarket = (
  markets: MarketFieldsFragment[] | undefined,
  baseAsset: AssetFieldsFragment,
  quoteAsset: AssetFieldsFragment
) => {
  if (!markets) return;
  const market = markets.find((m) => {
    if (!isSpot(m.tradableInstrument.instrument.product)) {
      return false;
    }
    const mBaseAsset = getBaseAsset(m);
    const mQuoteAsset = getQuoteAsset(m);
    return (
      (mBaseAsset.id === baseAsset.id && mQuoteAsset.id === quoteAsset.id) ||
      (mBaseAsset.id === quoteAsset.id && mQuoteAsset.id === baseAsset.id)
    );
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

  const { baseAmount, quoteAmount, priceImpactTolerance } = watch();

  const { pubKey } = useVegaWallet();
  const { data: markets } = useMarketsMapProvider();
  const { data: assetsData } = useAssetsMapProvider();
  const { data: accounts } = useAccounts(pubKey);
  const [quoteAsset, setQuoteAsset] = useState<AssetFieldsFragment>();
  const [baseAsset, setBaseAsset] = useState<AssetFieldsFragment>();
  const [marketId, setMarketId] = useState<string>(markets?.[0]?.id || '');
  const [priceImpactType, setPriceImpactType] = useState<'auto' | 'custom'>(
    'custom'
  );

  const { spotMarkets, spotAssets } = useMemo(() => {
    const spotAssets: Record<string, AssetFieldsFragment> = {};
    if (!markets) return {};
    const spotMarkets = Object.values(markets).filter((m) => {
      if (isSpot(m.tradableInstrument.instrument.product)) {
        const baseAsset = getBaseAsset(m);
        const quoteAsset = getQuoteAsset(m);

        if (baseAsset && assetsData) {
          spotAssets[baseAsset.id] = assetsData[baseAsset.id];
        }
        if (quoteAsset && assetsData) {
          spotAssets[quoteAsset.id] = assetsData[quoteAsset.id];
        }
        return true;
      }
      return false;
    });
    return { spotMarkets, spotAssets };
  }, [assetsData, markets]);
  const accountAssetIds = accounts?.map((a) => a.asset.id);

  const quoteAssetBalance = useMemo(() => {
    return assetBalance(quoteAsset, accounts);
  }, [accounts, quoteAsset]);

  const baseAssetBalance = useMemo(() => {
    return assetBalance(baseAsset, accounts);
  }, [accounts, baseAsset]);

  useEffect(() => {
    const market =
      baseAsset &&
      quoteAsset &&
      chooseMarket(spotMarkets, baseAsset, quoteAsset);
    if (market && isSpot(market.tradableInstrument.instrument.product)) {
      setMarketId(market.id);
    } else {
      setMarketId('');
    }
  }, [accounts, baseAsset, quoteAsset, spotMarkets]);

  const switchAssets = () => {
    const newBaseAsset = quoteAsset;
    const newQuoteAsset = baseAsset;
    setBaseAsset(newBaseAsset);
    setQuoteAsset(newQuoteAsset);
    newBaseAsset &&
      newQuoteAsset &&
      chooseMarket(spotMarkets, newBaseAsset, newQuoteAsset);
  };

  const switchAmounts = () => {
    const newBaseAmount = quoteAmount;
    const newQuoteAmount = baseAmount;
    setValue('baseAmount', newBaseAmount);
    setValue('quoteAmount', newQuoteAmount);
  };

  return (
    <div className="max-w-md mx-auto p-5 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1>{t('Swap')}</h1>
        {marketId && (
          <Link
            href={`/#/markets/${marketId}`}
            className="text-sm text-gray-500"
          >
            {<EmblemByMarket market={marketId} />}
            {t('Go to market')} <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
          </Link>
        )}
      </div>

      <div className="flex flex-col w-full gap-2">
        {/* You pay - in Quote asset */}
        <div className="dark:bg-vega-cdark-700 bg-vega-clight-700 p-4 rounded-lg border-gray-700 border flex flex-col gap-1">
          <span className="text-gray-500">{t('You pay')}</span>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={quoteAmount}
              onChange={(e) => {
                setValue('quoteAmount', e.target.value);
              }}
              className="w-24 dark:bg-vega-cdark-800 bg-vega-clight-800 p-2 rounded-lg mr-2 text-center "
            />
            <DropdownAsset
              assetId={quoteAsset?.id}
              onSelect={setQuoteAsset}
              assets={spotAssets}
            />
          </div>
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <span>{quoteAmount && `$${quoteAmount}`}</span>
            {accountAssetIds &&
            quoteAsset &&
            !accountAssetIds.includes(quoteAsset.id) ? (
              <span className="text-warning text-xs">
                {t(`You do not have this asset in your account`)}
              </span>
            ) : (
              <span>
                {quoteAssetBalance !== undefined &&
                  quoteAsset !== undefined &&
                  t('Balance: {{balance}}', {
                    balance: addDecimalsFormatNumber(
                      quoteAssetBalance,
                      quoteAsset.decimals
                    ),
                  })}
              </span>
            )}
          </div>
        </div>

        {/* Swap button */}
        <button
          className="flex justify-center p-2 w-fit rounded-full bg-vega-clight-700 dark:bg-black self-center -my-5 z-10 hover:bg-vega-clight-800 hover:dark:bg-vega-cdark-800 border-gray-400 border"
          onClick={() => {
            switchAssets();
            switchAmounts();
          }}
        >
          <VegaIcon name={VegaIconNames.SWAP} size={18} />
        </button>

        {/* You receive - in Base asset */}
        <div className="dark:bg-vega-cdark-700 bg-vega-clight-700 p-4 rounded-lg border-gray-700 border flex flex-col gap-2">
          <span className="text-gray-500">{t('You receive')}</span>
          <div className="flex items-center justify-between">
            <input
              type="number"
              onChange={(e) => {
                setValue('baseAmount', e.target.value);
              }}
              value={baseAmount}
              className="w-24 dark:bg-vega-cdark-800 bg-vega-clight-800 p-2 rounded-lg mr-2 text-center text-xxl"
            />
            <DropdownAsset
              assetId={baseAsset?.id}
              onSelect={setBaseAsset}
              assets={spotAssets}
            />
          </div>
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <span className="text-left">{baseAmount && `$${baseAmount}`}</span>
            <span className="text-right">
              {baseAssetBalance &&
                baseAsset &&
                t('Balance: {{balance}}', {
                  balance: addDecimalsFormatNumber(
                    baseAssetBalance,
                    baseAsset.decimals
                  ),
                })}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2 mt-2 text-gray-500">
          <span>{t('Price impact tolerance')}</span>
        </div>
        <div className="flex items-center">
          <input
            type="number"
            value={priceImpactTolerance}
            onChange={(e) => {
              setValue('priceImpactTolerance', e.target.value);
            }}
            className="w-16 dark:bg-vega-cdark-800 bg-vega-clight-800 p-2 rounded-lg mr-2 text-center"
          />
          <span>%</span>
          <button
            className="ml-4 dark:bg-vega-cdark-700 bg-vega-clight-700 hover:bg-vega-clight-800 hover:dark:bg-vega-cdark-800 p-2 rounded-lg text-sm"
            onClick={() =>
              priceImpactType === 'auto'
                ? setPriceImpactType('custom')
                : setPriceImpactType('auto')
            }
          >
            {t(priceImpactType === 'auto' ? 'AUTO' : 'CUSTOM')}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full dark:bg-vega-cdark-700 bg-vega-clight-700 hover:bg-vega-clight-800 hover:dark:bg-vega-cdark-800 p-4 rounded-lg "
      >
        {t('Swap now')}
      </button>
      <div className="mt-4 text-center text-gray-500">
        {quoteAsset &&
          quoteAmount &&
          baseAsset &&
          baseAmount &&
          `${formatNumber(quoteAmount)} ${quoteAsset?.symbol} = ${formatNumber(
            baseAmount
          )} ${baseAsset?.symbol}`}
      </div>
    </div>
  );
};

const DropdownAsset = ({
  assetId,
  onSelect,
  assets,
}: {
  assetId?: string;
  onSelect: (asset: AssetFieldsFragment) => void;
  assets?: Record<string, AssetFieldsFragment>;
}) => {
  const asset = assetId ? assets?.[assetId] : null;
  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger
          asChild
          className="flex items-center px-2 py-2 border-gray-400 border rounded-full"
        >
          {asset && <EmblemByAsset asset={asset.id} />}
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
