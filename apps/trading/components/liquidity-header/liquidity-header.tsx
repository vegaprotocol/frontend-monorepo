import {
  getAsset,
  tooltipMapping,
  useMarket,
  useStaticMarketData,
} from '@vegaprotocol/markets';
import { Header, HeaderStat, HeaderTitle } from '../header';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
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

export const LiquidityHeader = () => {
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

  const triggeringRatio =
    market?.liquidityMonitoringParameters.triggeringRatio || '1';

  const { percentage, status } = useCheckLiquidityStatus({
    suppliedStake: suppliedStake || 0,
    targetStake: targetStake || 0,
    triggeringRatio,
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
              t(
                '%s liquidity provision',
                market.tradableInstrument.instrument.code
              )}
          </HeaderTitle>
        )
      }
    >
      <HeaderStat
        heading={t('Target stake')}
        description={tooltipMapping['targetStake']}
        testId="target-stake"
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
        testId="supplied-stake"
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
      <HeaderStat heading={t('Liquidity supplied')} testId="liquidity-supplied">
        <Indicator variant={status} /> {formatNumberPercentage(percentage, 2)}
      </HeaderStat>
      <HeaderStat
        heading={t('Fees paid')}
        description={t(
          'The amount of fees paid to liquidity providers across the whole market during the last epoch %s.',
          feesObject?.node.epoch.toString() || '-'
        )}
        testId="fees-paid"
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
        <HeaderStat heading={t('Market ID')} testId="liquidity-market-id">
          <div className="break-word">
            <CopyWithTooltip text={marketId}>
              <button
                data-testid="copy-eth-oracle-address"
                className="uppercase text-right"
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
      <HeaderStat heading={t('Learn more')} testId="liquidity-learn-more">
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
