import { Link, useParams } from 'react-router-dom';

import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { useWallet } from '@vegaprotocol/wallet-react';
import { useAMM, useMarket } from '@vegaprotocol/rest';

import { useT } from '../../../../lib/use-t';
import { Links } from '../../../../lib/links';
import { HeaderPage } from '../../../../components/header-page';
import { LiquidityForm } from '../../../../components/amm/liquidity-form';
import { WalletNotConnectedAlert } from '../../../../components/amm/wallet-not-connected-alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { MarkPrice } from 'apps/trading/components/amm/stats/mark-price';

export const ManageLiquidity = () => {
  const t = useT();
  const { marketId } = useParams();

  const { data: market } = useMarket(marketId);

  const [pubKey, status] = useWallet((store) => [store.pubKey, store.status]);

  const isConnected = status === 'connected' && pubKey;

  const { data: amm } = useAMM({
    marketId,
    partyId: pubKey,
  });

  if (!market) {
    return (
      <Notification
        title={t('AMM_MARKET_NO_MARKET')}
        intent={Intent.Warning}
        message={
          <>
            <p>{t('AMM_MARKET_NO_MARKET_DESCRIPTION', { marketId })}</p>
            <Link className="underline" to={Links.AMM_POOLS()}>
              {t('AMM_POOLS_GOTO_POOLS')}
            </Link>
          </>
        }
      />
    );
  }

  const defaultValues = amm
    ? {
        marketId: market.id,
        amount: amm.commitment.value.toNumber(),
        fee: Number(amm.proposedFee),
        slippageTolerance: undefined,
        base: amm.base.value.toNumber(),
        upperBound: amm.upperBound.value.toNumber(),
        leverageAtUpperBound: amm.leverageAtUpperBound,
        lowerBound: amm.lowerBound.value.toNumber(),
        leverageAtLowerBound: amm.leverageAtLowerBound,
      }
    : {
        marketId: market.id,
      };

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={Links.AMM_POOLS()}>{t('AMM_POOLS_TITLE')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={Links.AMM_POOL(market.id)}>{market.code}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{t('AMM_LIQUIDITY_TITLE')}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderPage>{market.code}</HeaderPage>

      <dl className="flex gap-2">
        {amm && (
          <>
            <div>
              <dt className="text-surface-1-fg-muted uppercase text-xs">
                {t('My liquidity')}
              </dt>
              <dd>
                {amm.commitment.value.toFormat()}{' '}
                {market.settlementAsset.symbol}
              </dd>
            </div>
            <div className="border-r mx-2" />
          </>
        )}
        <div>
          <dt className="text-surface-1-fg-muted uppercase text-xs">
            {t('Mark price')}
          </dt>
          <dd>
            <MarkPrice market={market} />
          </dd>
        </div>
      </dl>

      <div>
        {!isConnected ? (
          <WalletNotConnectedAlert />
        ) : (
          <LiquidityForm
            market={market}
            pubKey={pubKey}
            type={amm ? 'amend' : 'submit'}
            defaultValues={defaultValues}
          />
        )}
      </div>
    </>
  );
};
