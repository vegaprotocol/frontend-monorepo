import {
  getAsset,
  useTooltipMapping,
  useMarket,
  useStaticMarketData,
} from '@vegaprotocol/markets';
import { Header, HeaderStat, HeaderTitle } from '../header';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import {
  CopyWithTooltip,
  ExternalLink,
  Indicator,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import { DocsLinks } from '@vegaprotocol/environment';
import {
  useCheckLiquidityStatus,
  usePaidFeesQuery,
} from '@vegaprotocol/liquidity';
import { useParams } from 'react-router-dom';
import { useT } from '../../lib/use-t';

export const LiquidityHeader = () => {
  const t = useT();
  const tooltipMapping = useTooltipMapping();
  const { marketId } = useParams();
  const { data: market } = useMarket(marketId);
  const { data: marketData } = useStaticMarketData(marketId);
  const { data: feesPaidRes } = usePaidFeesQuery({
    variables: { marketId: marketId || '' },
  });
  const targetStake = marketData?.targetStake;
  const suppliedStake = marketData?.suppliedStake;

  const asset = market && getAsset(market);

  const assetDecimalPlaces = asset?.decimals || 0;
  const symbol = asset?.symbol;

  const { percentage, status } = useCheckLiquidityStatus({
    suppliedStake: suppliedStake || 0,
    targetStake: targetStake || 0,
  });

  const feesObject = feesPaidRes?.paidLiquidityFees?.edges?.find(
    (e) => e?.node.marketId === marketId
  );

  return (
    <Header
      title={
        market?.tradableInstrument.instrument.code &&
        marketId && (
          <HeaderTitle>
            {market.tradableInstrument.instrument.code &&
              t('{{instrumentCode}} liquidity provision', {
                instrumentCode: market.tradableInstrument.instrument.code,
              })}
          </HeaderTitle>
        )
      }
    >
      <HeaderStat
        heading={t('Target stake')}
        description={tooltipMapping['targetStake']}
        data-testid="target-stake"
      >
        <div>
          {targetStake
            ? `${addDecimalsFormatNumber(
                targetStake,
                assetDecimalPlaces ?? 0
              )} ${symbol}`
            : '-'}
        </div>
      </HeaderStat>
      <HeaderStat
        heading={t('Supplied stake')}
        description={tooltipMapping['suppliedStake']}
        data-testid="supplied-stake"
      >
        <div>
          {suppliedStake
            ? `${addDecimalsFormatNumber(
                suppliedStake,
                assetDecimalPlaces ?? 0
              )} ${symbol}`
            : '-'}
        </div>
      </HeaderStat>
      <HeaderStat
        heading={t('Liquidity supplied')}
        data-testid="liquidity-supplied"
      >
        <Indicator variant={status} /> {formatNumberPercentage(percentage, 2)}
      </HeaderStat>
      <HeaderStat
        heading={t('Fees paid')}
        description={t(
          'The amount of fees paid to liquidity providers across the whole market during the last epoch {{epoch}}.',
          { epoch: feesObject?.node.epoch.toString() || '-' }
        )}
        data-testid="fees-paid"
      >
        <div>
          {feesObject?.node.totalFeesPaid
            ? `${addDecimalsFormatNumber(
                feesObject?.node.totalFeesPaid,
                assetDecimalPlaces ?? 0
              )} ${symbol}`
            : '-'}
        </div>
      </HeaderStat>
      {marketId && (
        <HeaderStat heading={t('Market ID')} data-testid="liquidity-market-id">
          <div className="break-word">
            <CopyWithTooltip text={marketId}>
              <button
                data-testid="copy-eth-oracle-address"
                className="text-right uppercase"
              >
                <span className="flex gap-1">
                  {truncateMiddle(marketId)}
                  <VegaIcon name={VegaIconNames.COPY} size={16} />
                </span>
              </button>
            </CopyWithTooltip>
          </div>
        </HeaderStat>
      )}
      <HeaderStat heading={t('Learn more')} data-testid="liquidity-learn-more">
        {DocsLinks ? (
          <ExternalLink href={DocsLinks.LIQUIDITY}>
            {t('Providing liquidity')}
          </ExternalLink>
        ) : (
          (null as React.ReactNode)
        )}
      </HeaderStat>
    </Header>
  );
};
