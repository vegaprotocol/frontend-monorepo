import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { HeaderStat } from '../../header';
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
  addDecimalsFormatNumberQuantum,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { DocsLinks } from '@vegaprotocol/environment';
import { useMarket } from '@vegaprotocol/data-provider';
import { Link } from 'react-router-dom';
import { Links } from '../../../lib/links';
import { useT } from '../../../lib/use-t';

interface LiquidityStatProps {
  marketId: string;
  assetDecimals: number;
  quantum: string;
}

export const LiquidityStat = ({
  marketId,
  assetDecimals,
  quantum,
}: LiquidityStatProps) => {
  const t = useT();

  const { data } = useMarket({ marketId });

  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
    NetworkParams.market_liquidity_targetstake_triggering_ratio,
  ]);

  const stakeToCcyVolume = params.market_liquidity_stakeToCcyVolume;

  const supplied = data?.data?.suppliedStake
    ? addDecimalsFormatNumberQuantum(
        new BigNumber(data.data.suppliedStake)
          .multipliedBy(stakeToCcyVolume || 1)
          .toString(),
        assetDecimals,
        quantum
      )
    : '-';

  const { percentage, status } = useCheckLiquidityStatus({
    suppliedStake: data?.data?.suppliedStake || 0,
    targetStake: data?.data?.targetStake || 0,
  });

  const showMessage =
    percentage.gte(100) &&
    data?.data?.marketTradingMode ===
      MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    data?.data?.trigger ===
      AuctionTrigger.AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS;

  const description = marketId ? (
    <section data-testid="liquidity-supplied-tooltip">
      <div className="mb-2">
        <KeyValueTable>
          <KeyValueTableRow>
            <span>{t('Supplied stake')}</span>
            <span>
              {data?.data?.suppliedStake
                ? addDecimalsFormatNumberQuantum(
                    data.data.suppliedStake,
                    assetDecimals,
                    quantum
                  )
                : '-'}
            </span>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <span>{t('Target stake')}</span>
            <span>
              {data?.data?.targetStake
                ? addDecimalsFormatNumberQuantum(
                    data.data.targetStake,
                    assetDecimals,
                    quantum
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
        <Link to={Links.LIQUIDITY(marketId)} data-testid="view-liquidity-link">
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
      data-testid="liquidity-supplied"
    >
      <Indicator variant={status} /> {supplied} (
      {percentage.gt(100) ? '>100%' : formatNumberPercentage(percentage, 2)})
    </HeaderStat>
  ) : (
    <HeaderStat
      heading={t('Liquidity supplied')}
      data-testid="liquidity-supplied"
    >
      {'-'}
    </HeaderStat>
  );
};
