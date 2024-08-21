import { LiquidityForm } from '../../../../components/amm/liquidity-form';
import { WalletNotConnectedAlert } from '../../../../components/amm/wallet-not-connected-alert';

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

import { useAMMs } from '@vegaprotocol/rest';
import { useMarket } from '@vegaprotocol/rest';
import { t } from '../../../../lib/use-t';
import { Links } from '../../../../lib/links';
import { Link, useParams } from 'react-router-dom';
import { useWallet } from '@vegaprotocol/wallet-react';

export const ManageLiquidity = () => {
  const { marketId } = useParams();

  const { data: market } = useMarket(marketId);

  const [pubKey, status] = useWallet((store) => [store.pubKey, store.status]);

  const isConnected = status === 'connected' && pubKey;

  const { data: amms } = useAMMs({ marketId, partyId: pubKey });

  let amm = undefined;
  if (isConnected && amms) {
    amm = amms.find((a) => a.partyId === pubKey && a.marketId === marketId);
  }

  if (!market) {
    return (
      <>
        <Alert>
          <AlertTitle>{t('MARKET_NO_MARKET')}</AlertTitle>
          <AlertDescription>
            <p>{t('MARKET_NO_MARKET_DESCRIPTION', { marketId })}</p>
            <Link to={Links.AMM_POOLS()}>
              <Button>{t('POOLS_GOTO_POOLS')}</Button>
            </Link>
          </AlertDescription>
        </Alert>
      </>
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
        leverageAtUpperBound: amm.leverageAtUpperBound.value.toNumber(),
        lowerBound: amm.lowerBound.value.toNumber(),
        leverageAtLowerBound: amm.leverageAtLowerBound.value.toNumber(),
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
              <Link to={Links.AMM_POOLS()}>{t('POOLS_TITLE')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={Links.AMM_POOL(market.id)}>{market.code}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{t('LIQUIDITY_TITLE')}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl lg:text-6xl leading-[1em] font-alt calt mb-2 lg:mb-10">
          {market.code}
        </h1>
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
