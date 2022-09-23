import type { LiquidityProvisionStatus } from '@vegaprotocol/types';
import { AccountType } from '@vegaprotocol/types';
import { useNetworkParam } from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';
import type { FeeShareFieldsFragment } from './__generated__/MarketLiquidity';
import { useMarketLiquidityQuery } from './__generated__/MarketLiquidity';

const SISKA_NETWORK_PARAMETER = 'market.liquidity.stakeToCcySiskas';

export interface LiquidityProvision {
  party: string;
  commitmentAmount: string | undefined;
  fee: string | undefined;
  equityLikeShare: string;
  averageEntryValuation: string;
  obligation: string | null;
  supplied: string | null;
  status?: LiquidityProvisionStatus;
  createdAt: string | undefined;
  updatedAt: string | null | undefined;
}

export interface LiquidityData {
  liquidityProviders: LiquidityProvision[];
  suppliedStake?: string | null;
  targetStake?: string | null;
  code?: string;
  symbol?: string;
  decimalPlaces?: number;
  positionDecimalPlaces?: number;
  assetDecimalPlaces?: number;
  name?: string;
}

export const useLiquidityProvision = ({
  marketId,
  partyId,
}: {
  partyId?: string;
  marketId: string;
}) => {
  const { data: stakeToCcySiskas } = useNetworkParam(SISKA_NETWORK_PARAMETER);
  const stakeToCcySiska = stakeToCcySiskas && stakeToCcySiskas[0];
  const { data, loading, error } = useMarketLiquidityQuery({
    variables: { marketId },
  });
  const liquidityProviders = (
    data?.market?.data?.liquidityProviderFeeShare || []
  )
    ?.filter((p: FeeShareFieldsFragment) => !partyId || p.party.id === partyId) // if partyId is provided, filter out other parties
    .map((provider: FeeShareFieldsFragment) => {
      const liquidityProvisionConnection =
        data?.market?.liquidityProvisionsConnection?.edges?.find(
          (e) => e?.node.party.id === provider.party.id
        );
      const balance =
        liquidityProvisionConnection?.node?.party.accountsConnection?.edges?.reduce(
          (acc, e) => {
            return e?.node.type === AccountType.ACCOUNT_TYPE_BOND // just an extra check to make sure we only use bond accounts
              ? acc.plus(new BigNumber(e?.node.balance ?? 0))
              : acc;
          },
          new BigNumber(0)
        );
      const obligation =
        stakeToCcySiska &&
        new BigNumber(stakeToCcySiska)
          .times(liquidityProvisionConnection?.node?.commitmentAmount ?? 1)
          .toString();
      const supplied =
        stakeToCcySiska &&
        new BigNumber(stakeToCcySiska).times(balance ?? 1).toString();
      return {
        party: provider.party.id,
        createdAt: liquidityProvisionConnection?.node?.createdAt,
        updatedAt: liquidityProvisionConnection?.node?.updatedAt,
        commitmentAmount: liquidityProvisionConnection?.node?.commitmentAmount,
        fee: liquidityProvisionConnection?.node?.fee,
        status: liquidityProvisionConnection?.node?.status,
        equityLikeShare: provider.equityLikeShare,
        averageEntryValuation: provider.averageEntryValuation,
        obligation,
        supplied,
      };
    });
  const liquidityData: LiquidityData = {
    liquidityProviders,
    suppliedStake: data?.market?.data?.suppliedStake,
    targetStake: data?.market?.data?.targetStake,
    decimalPlaces: data?.market?.decimalPlaces,
    positionDecimalPlaces: data?.market?.positionDecimalPlaces,
    code: data?.market?.tradableInstrument.instrument.code,
    name: data?.market?.tradableInstrument.instrument.name,
    assetDecimalPlaces:
      data?.market?.tradableInstrument.instrument.product.settlementAsset
        .decimals,
    symbol:
      data?.market?.tradableInstrument.instrument.product.settlementAsset
        .symbol,
  };
  return { data: liquidityData, loading, error };
};
