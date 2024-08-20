import { AMMTotalLiquidity } from '@/components/app/stats/amm-total-liquidity';
import { LiquidityChart } from '@/components/app/stats/liquidity-chart';
import { LiquidityTable } from '@/components/app/stats/liquidity-table';
import { LPTotalLiquidity } from '@/components/app/stats/lp-total-liquidity';
import { MarkPrice } from '@/components/app/stats/mark-price';
import { MarketDepth } from '@/components/app/stats/market-depth';
import { TotalFees } from '@/components/app/stats/total-fee';
import { Volume24 } from '@/components/app/stats/volume-24';
import { VolumeChart } from '@/components/app/stats/volume-chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CONSOLE_URL, DOCS_UPDATE_MARKET_TUTORIAL_URL } from '@/env';
import { useAMMs } from '@/lib/hooks/use-amms';
import { useMarket } from '@/lib/hooks/use-markets';
import { useWallet } from '@/lib/hooks/use-wallet';
import type { Market } from '@/lib/queries/markets';
import { t } from '@/lib/utils';
import { Links } from '@/router';
import { TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { v1AMMStatus } from '@vegaprotocol/rest-clients/dist/trading-data';
import { BoxIcon, DownloadIcon, Edit2Icon, ShareIcon } from 'lucide-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Link, useParams } from 'react-router-dom';

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
            <Link to={Links.POOLS()}>
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
              <Link to={Links.POOLS()}>{t('POOLS_TITLE')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{market.code}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1">
          <div>
            {/** EMBLEM PLACEHOLDER */}
            <BoxIcon />
          </div>
          <h1 className="text-2xl">{market.code}</h1>
          <a
            href={DOCS_UPDATE_MARKET_TUTORIAL_URL}
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
        </div>
        <div className="flex gap-1">
          <Link to={Links.POOLS_MARKET_MANAGE(marketId)}>
            <Button size="sm" className="flex gap-1">
              <DownloadIcon size={16} />{' '}
              {!committed
                ? t('POOLS_ADD_LIQUIDITY')
                : t('POOLS_MANAGE_LIQUIDITY')}
            </Button>
          </Link>

          <a
            href={`${CONSOLE_URL}/#/markets/${market.id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" variant="outline">
              {t('POOLS_MARKET_TRADE')}
            </Button>
          </a>

          <Tooltip defaultOpen={false}>
            <TooltipTrigger asChild>
              <CopyToClipboard text={globalThis.location.href}>
                <Button size="sm" variant="outline">
                  <ShareIcon size={12} />
                </Button>
              </CopyToClipboard>
            </TooltipTrigger>
            <TooltipContent>{t('CLIPBOARD_COPIED')}</TooltipContent>
          </Tooltip>
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
