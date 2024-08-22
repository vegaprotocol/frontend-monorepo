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

import { useAMMs } from '@vegaprotocol/rest';
import { useMarket } from '@vegaprotocol/rest';
import { t } from '../../../../lib/use-t';
import { Links } from '../../../../lib/links';
import { Link, useParams } from 'react-router-dom';
import { useWallet } from '@vegaprotocol/wallet-react';
import { HeaderPage } from '../../../../components/header-page';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';

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
      <Notification
        title={t('MARKET_NO_MARKET')}
        intent={Intent.Warning}
        message={
          <>
            <p>{t('MARKET_NO_MARKET_DESCRIPTION', { marketId })}</p>
            <Link className="underline" to={Links.AMM_POOLS()}>
              {t('POOLS_GOTO_POOLS')}
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
