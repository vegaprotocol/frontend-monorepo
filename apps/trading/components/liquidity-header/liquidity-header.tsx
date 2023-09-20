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
import { ExternalLink, Indicator } from '@vegaprotocol/ui-toolkit';
import { DocsLinks } from '@vegaprotocol/environment';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { useCheckLiquidityStatus } from '@vegaprotocol/liquidity';
import { useParams } from 'react-router-dom';

export const LiquidityHeader = () => {
  const { marketId } = useParams();
  const { data: market } = useMarket(marketId);
  const { data: marketData } = useStaticMarketData(marketId);
  const targetStake = marketData?.targetStake;
  const suppliedStake = marketData?.suppliedStake;

  const asset = market && getAsset(market);

  const assetDecimalPlaces = asset?.decimals || 0;
  const symbol = asset?.symbol;

  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
    NetworkParams.market_liquidity_targetstake_triggering_ratio,
  ]);
  const triggeringRatio =
    params.market_liquidity_targetstake_triggering_ratio || '1';

  const { percentage, status } = useCheckLiquidityStatus({
    suppliedStake: suppliedStake || 0,
    targetStake: targetStake || 0,
    triggeringRatio,
  });

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
      <HeaderStat heading={t('Market ID')} testId="liquidity-market-id">
        <div className="break-word">{marketId}</div>
      </HeaderStat>
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
