import { AMMTotalLiquidity } from '../../../../components/amm/stats/amm-total-liquidity';
import { LiquidityChart } from '../../../../components/amm/stats/liquidity-chart';
import { LiquidityTable } from '../../../../components/amm/stats/liquidity-table';
import { LPTotalLiquidity } from '../../../../components/amm/stats/lp-total-liquidity';
import { MarkPrice } from '../../../../components/amm/stats/mark-price';
import { MarketDepth } from '../../../../components/amm/stats/market-depth';
import { TotalFees } from '../../../../components/amm/stats/total-fee';
import { Volume24 } from '../../../../components/amm/stats/volume-24';
import { VolumeChart } from '../../../../components/amm/stats/volume-chart';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../../components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { Button } from '../../../../components/ui/button';
import { Tabs } from '../../../../components/ui/tabs';

import { useAMMs, useMarket, type Market } from '@vegaprotocol/rest';

import { TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { v1AMMStatus } from '@vegaprotocol/rest-clients/dist/trading-data';
import { DownloadIcon, Edit2Icon, ShareIcon } from 'lucide-react';

import { Link, useParams } from 'react-router-dom';
import { useWallet } from '@vegaprotocol/wallet-react';
import { Links } from 'apps/trading/lib/links';
import { t } from 'apps/trading/lib/use-t';
import { CopyWithTooltip } from '@vegaprotocol/ui-toolkit';
import { DocsLinks } from '@vegaprotocol/environment';
import { EmblemByMarket } from '@vegaprotocol/emblem';

export const MarketPage = () => {
  const { marketId } = useParams();
  const { data: market } = useMarket(marketId);

  const [partyId, status] = useWallet((state) => [state.pubKey, state.status]);
  const { data: amms } = useAMMs({ marketId });

  const committed =
    status === 'connected' &&
    amms?.find(
      (a) =>
        a.partyId === partyId &&
        a.marketId === marketId &&
        a.status === v1AMMStatus.STATUS_ACTIVE
    );

  if (!market) {
    return (
      <>
        <Alert>
          <AlertTitle>{t('MARKET_NO_MARKET')}</AlertTitle>
          <AlertDescription>
            <p>{t('MARKET_NO_MARKET_DESCRIPTION')}</p>
            <Link to={Links.AMM_POOLS()}>
              <Button>{t('POOLS_GOTO_POOLS')}</Button>
            </Link>
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={Links.AMM_POOLS()}>{t('POOLS_TITLE')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{market.code}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <EmblemByMarket market={market.id} />
          <h1 className="text-3xl lg:text-6xl leading-[1em] font-alt calt">
            {market.code}
          </h1>
          {DocsLinks?.UPDATE_MARKET_TUTORIAL_URL && (
            <a
              href={DocsLinks.UPDATE_MARKET_TUTORIAL_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="xs"
                className="h-6 w-6 rounded-full p-1"
              >
                <Edit2Icon size={12} />
              </Button>
            </a>
          )}
        </div>
        <div className="flex gap-1">
          <Link to={Links.AMM_POOL_MANAGE(market.id)}>
            <Button size="sm" className="flex gap-1">
              <DownloadIcon size={16} />{' '}
              {!committed
                ? t('POOLS_ADD_LIQUIDITY')
                : t('POOLS_MANAGE_LIQUIDITY')}
            </Button>
          </Link>

          <Link to={Links.MARKET(market.id)}>
            <Button size="sm" variant="outline">
              {t('POOLS_MARKET_TRADE')}
            </Button>
          </Link>

          <CopyWithTooltip text={globalThis.location.href}>
            <Button size="sm" variant="outline">
              <ShareIcon size={12} />
            </Button>
          </CopyWithTooltip>
        </div>
      </div>

      <div className="flex flex-col gap-1 md:flex-row">
        <div className="rounded border p-2 md:w-1/3">
          <MarketStats market={market} />
        </div>
        <div className="flex-grow rounded border p-1">
          <Tabs defaultValue="volume">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="volume" asChild>
                <Button
                  size="xs"
                  variant="outline"
                  className='data-[state="active"]:bg-primary data-[state="active"]:text-primary-foreground'
                >
                  {t('CHART_VOLUME_TITLE')}
                </Button>
              </TabsTrigger>
              <TabsTrigger value="liquidity" asChild>
                <Button
                  size="xs"
                  variant="outline"
                  className='data-[state="active"]:bg-primary data-[state="active"]:text-primary-foreground'
                >
                  {t('CHART_LIQUIDITY_TITLE')}
                </Button>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="volume">
              <VolumeChart market={market} />
            </TabsContent>
            <TabsContent value="liquidity">
              <LiquidityChart market={market} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <dl className="flex divide-x-2 rounded border">
        <div className="flex-1 p-2">
          <dt className="text-xs uppercase">
            {t('MARKET_DETAILS_AMM_LIQUIDITY_COMMITTED')}
          </dt>
          <dd>
            <AMMTotalLiquidity market={market} />
          </dd>
        </div>
        <div className="flex-1 p-2">
          <dt className="text-xs uppercase">
            {t('MARKET_DETAILS_LP_LIQUIDITY_COMMITTED')}
          </dt>
          <dd>
            <LPTotalLiquidity market={market} />
          </dd>
        </div>
      </dl>

      <div>
        <LiquidityTable market={market} />
      </div>
    </>
  );
};

const MarketStats = ({ market }: { market: Market }) => {
  return (
    <dl className="flex flex-col gap-2">
      <div>
        <dt className="text-xs uppercase">{t('MARKET_DETAILS_MARK_PRICE')}</dt>
        <dd>
          <MarkPrice market={market} />
        </dd>
      </div>

      <div>
        <dt className="text-xs uppercase">
          {t('MARKET_DETAILS_TOTAL_REWARD')}
        </dt>
        <dd>-</dd>
      </div>

      <div>
        <dt className="text-xs uppercase">{t('MARKET_DETAILS_VOLUME_24')}</dt>
        <dd>
          <Volume24 market={market} />
        </dd>
      </div>

      <div>
        <dt className="text-xs uppercase">
          {t('MARKET_DETAILS_ORDER_BOOK_DEPTH')}
        </dt>
        <dd>
          <MarketDepth market={market} />
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase">
          {t('MARKET_DETAILS_TOTAL_FEES_24')}
        </dt>
        <dd>
          <TotalFees market={market} />
        </dd>
      </div>
    </dl>
  );
};
