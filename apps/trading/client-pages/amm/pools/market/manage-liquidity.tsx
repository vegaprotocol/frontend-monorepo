import { Link, useParams } from 'react-router-dom';

import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { useWallet } from '@vegaprotocol/wallet-react';
import { useAMMs, useMarket, isActiveAMM } from '@vegaprotocol/rest';

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

export const ManageLiquidity = () => {
  const t = useT();
  const { marketId } = useParams();

  const { data: market } = useMarket(marketId);

  const [pubKey, status] = useWallet((store) => [store.pubKey, store.status]);

  const isConnected = status === 'connected' && pubKey;

  const { data: amms } = useAMMs({
    marketId,
    partyId: pubKey,
  });

  let amm = undefined;
  if (isConnected && amms) {
    amm = amms
      .filter(isActiveAMM)
      .find((a) => a.partyId === pubKey && a.marketId === marketId);
  }

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

      <div className="flex items-baseline justify-between">
        <HeaderPage>{market.code}</HeaderPage>
      </div>

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
