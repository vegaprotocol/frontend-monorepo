import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { ButtonLink, Link } from '@vegaprotocol/ui-toolkit';
import { MarketProposalNotification } from '@vegaprotocol/governance';
import { getExpiryDate } from '@vegaprotocol/market-info';
import { t } from '@vegaprotocol/react-helpers';
import type { SingleMarketFieldsFragment } from '@vegaprotocol/market-list';
import {
  ColumnKind,
  SelectMarketPopover,
} from '../../components/select-market';
import type { OnCellClickHandler } from '../../components/select-market';
import { Header, HeaderStat } from '../../components/header';
import { NO_MARKET } from './constants';
import { MarketMarkPrice } from '../../components/market-mark-price';
import { Last24hPriceChange } from '../../components/last-24h-price-change';
import { Last24hVolume } from '../../components/last-24h-volume';
import { MarketState } from '../../components/market-state';
import { MarketTradingMode } from '../../components/market-trading-mode';
import { MarketLiquiditySupplied } from '../../components/liquidity-supplied';

interface TradeMarketHeaderProps {
  market: SingleMarketFieldsFragment | null;
  onSelect: (marketId: string) => void;
}

export const TradeMarketHeader = ({
  market,
  onSelect,
}: TradeMarketHeaderProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const asset = market?.tradableInstrument.instrument.product?.settlementAsset;

  const onCellClick: OnCellClickHandler = (e, kind, value) => {
    if (value && kind === ColumnKind.Asset) {
      openAssetDetailsDialog(value, e.target as HTMLElement);
    }
  };

  return (
    <Header
      title={
        <SelectMarketPopover
          marketName={market?.tradableInstrument.instrument.name || NO_MARKET}
          onSelect={onSelect}
          onCellClick={onCellClick}
        />
      }
    >
      <HeaderStat
        heading={t('Expiry')}
        description={
          market && (
            <ExpiryTooltipContent
              market={market}
              explorerUrl={VEGA_EXPLORER_URL}
            />
          )
        }
        testId="market-expiry"
      >
        <ExpiryLabel market={market} />
      </HeaderStat>
      <MarketMarkPrice
        marketId={market?.id}
        decimalPlaces={market?.decimalPlaces}
        isHeader
      />
      <Last24hPriceChange
        marketId={market?.id}
        decimalPlaces={market?.decimalPlaces}
        isHeader
      />
      <Last24hVolume
        marketId={market?.id}
        positionDecimalPlaces={market?.positionDecimalPlaces}
        isHeader
      />
      <MarketTradingMode marketId={market?.id} onSelect={onSelect} isHeader />
      <MarketState market={market} />
      {asset ? (
        <HeaderStat
          heading={t('Settlement asset')}
          testId="market-settlement-asset"
        >
          <div>
            <ButtonLink
              onClick={(e) => {
                openAssetDetailsDialog(asset.id, e.target as HTMLElement);
              }}
            >
              {asset.symbol}
            </ButtonLink>
          </div>
        </HeaderStat>
      ) : null}
      <MarketProposalNotification marketId={market?.id} />
      <MarketLiquiditySupplied
        marketId={market?.id}
        assetDecimals={asset?.decimals || 0}
      />
    </Header>
  );
};

type ExpiryLabelProps = {
  market: SingleMarketFieldsFragment | null;
};

const ExpiryLabel = ({ market }: ExpiryLabelProps) => {
  const content = market ? getExpiryDate(market) : '-';
  return <div data-testid="trading-expiry">{content}</div>;
};

type ExpiryTooltipContentProps = {
  market: SingleMarketFieldsFragment;
  explorerUrl?: string;
};

const ExpiryTooltipContent = ({
  market,
  explorerUrl,
}: ExpiryTooltipContentProps) => {
  if (market?.marketTimestamps.close === null) {
    const oracleId =
      market.tradableInstrument.instrument.product
        .dataSourceSpecForTradingTermination?.id;

    return (
      <section data-testid="expiry-tool-tip">
        <p className="mb-2">
          {t(
            'This market expires when triggered by its oracle, not on a set date.'
          )}
        </p>
        {explorerUrl && oracleId && (
          <Link href={`${explorerUrl}/oracles#${oracleId}`} target="_blank">
            {t('View oracle specification')}
          </Link>
        )}
      </section>
    );
  }

  return null;
};
