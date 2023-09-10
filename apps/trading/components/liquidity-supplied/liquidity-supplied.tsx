import { useCallback, useMemo, useState } from 'react';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { MarketData } from '@vegaprotocol/markets';
import { marketDataProvider, marketProvider } from '@vegaprotocol/markets';
import { HeaderStat } from '../header';
import {
  ExternalLink,
  Indicator,
  KeyValueTable,
  KeyValueTableRow,
  Link as UILink,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useCheckLiquidityStatus } from '@vegaprotocol/liquidity';
import { AuctionTrigger, MarketTradingMode } from '@vegaprotocol/types';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { DocsLinks } from '@vegaprotocol/environment';
import { Link } from 'react-router-dom';

interface Props {
  marketId?: string;
  noUpdate?: boolean;
  assetDecimals: number;
}

export const MarketLiquiditySupplied = ({
  marketId,
  assetDecimals,
  noUpdate = false,
}: Props) => {
  const [market, setMarket] = useState<MarketData>();
  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
    NetworkParams.market_liquidity_targetstake_triggering_ratio,
  ]);

  const stakeToCcyVolume = params.market_liquidity_stakeToCcyVolume;
  const triggeringRatio = Number(
    params.market_liquidity_targetstake_triggering_ratio
  );

  const variables = useMemo(
    () => ({
      marketId: marketId || '',
    }),
    [marketId]
  );

  const { data } = useDataProvider({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      if (!noUpdate && marketData) {
        setMarket(marketData);
      }
      return true;
    },
    [noUpdate]
  );

  useDataProvider({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: noUpdate || !marketId || !data,
  });

  const supplied = market?.suppliedStake
    ? addDecimalsFormatNumber(
        new BigNumber(market?.suppliedStake)
          .multipliedBy(stakeToCcyVolume || 1)
          .toString(),
        assetDecimals
      )
    : '-';

  const { percentage, status } = useCheckLiquidityStatus({
    suppliedStake: market?.suppliedStake || 0,
    targetStake: market?.targetStake || 0,
    triggeringRatio,
  });

  const showMessage =
    percentage.gte(100) &&
    market?.marketTradingMode ===
      MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    market.trigger ===
      AuctionTrigger.AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS;

  const description = marketId ? (
    <section data-testid="liquidity-supplied-tooltip">
      <div className="mb-2">
        <KeyValueTable>
          <KeyValueTableRow>
            <span>{t('Supplied stake')}</span>
            <span>
              {market?.suppliedStake
                ? addDecimalsFormatNumber(
                    new BigNumber(market?.suppliedStake).toString(),
                    assetDecimals
                  )
                : '-'}
            </span>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <span>{t('Target stake')}</span>
            <span>
              {market?.targetStake
                ? addDecimalsFormatNumber(
                    new BigNumber(market?.targetStake).toString(),
                    assetDecimals
                  )
                : '-'}
            </span>
          </KeyValueTableRow>
        </KeyValueTable>
      </div>
      {showMessage && (
        <p className="mb-2">
          {t(
            'The market has sufficient liquidity but there are not enough priced limit orders in the order book, which are required to deploy liquidity commitment pegged orders.'
          )}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Link to="liquidity" data-testid="view-liquidity-link">
          <UILink>{t('View liquidity provision table')}</UILink>
        </Link>
      </div>
      {DocsLinks && (
        <div>
          <ExternalLink href={DocsLinks.LIQUIDITY} className="mt-2">
            {t('Learn about providing liquidity')}
          </ExternalLink>
        </div>
      )}
    </section>
  ) : (
    '-'
  );

  return marketId ? (
    <HeaderStat
      heading={t('Liquidity supplied')}
      description={description}
      testId="liquidity-supplied"
    >
      <Indicator variant={status} /> {supplied} (
      {percentage.gt(100) ? '>100%' : formatNumberPercentage(percentage, 2)})
    </HeaderStat>
  ) : (
    <HeaderStat heading={t('Liquidity supplied')} testId="liquidity-supplied">
      {'-'}
    </HeaderStat>
  );
};
