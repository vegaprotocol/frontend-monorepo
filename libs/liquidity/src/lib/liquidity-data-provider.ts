import compact from 'lodash/compact';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';

import {
  LiquidityProvidersDocument,
  LiquidityProvisionsDocument,
} from './__generated__/MarketLiquidity';

import type {
  LiquidityProviderFieldsFragment,
  LiquidityProvidersQuery,
  LiquidityProvidersQueryVariables,
  LiquidityProvisionFieldsFragment,
  LiquidityProvisionsQuery,
  LiquidityProvisionsQueryVariables,
} from './__generated__/MarketLiquidity';

export const liquidityProvisionsDataProvider = makeDataProvider<
  LiquidityProvisionsQuery,
  LiquidityProvisionFieldsFragment[],
  never,
  never,
  LiquidityProvisionsQueryVariables
>({
  query: LiquidityProvisionsDocument,
  getData: (responseData: LiquidityProvisionsQuery | null) => {
    return (
      responseData?.market?.liquidityProvisions?.edges?.map(
        (e) => e?.node.current
      ) ?? []
    ).filter((n) => !!n) as LiquidityProvisionFieldsFragment[];
  },
});

export const lpDataProvider = makeDataProvider<
  LiquidityProvidersQuery,
  LiquidityProviderFieldsFragment[],
  never,
  never,
  LiquidityProvidersQueryVariables
>({
  query: LiquidityProvidersDocument,
  getData: (data) => {
    return (
      data?.liquidityProviders?.edges.filter(Boolean).map((e) => e.node) ?? []
    );
  },
});

export type Filter = { partyId?: string; active?: boolean };

export const lpAggregatedDataProvider = makeDerivedDataProvider<
  LiquidityProvisionData[],
  never,
  LiquidityProvisionsQueryVariables & { filter?: Filter }
>(
  [
    (callback, client, variables) =>
      liquidityProvisionsDataProvider(callback, client, {
        marketId: variables.marketId,
      }),
    (callback, client, variables) =>
      lpDataProvider(callback, client, {
        marketId: variables.marketId,
      }),
  ],
  (
    [liquidityProvisions, liquidityProvider],
    { filter }
  ): LiquidityProvisionData[] => {
    return getLiquidityProvision(
      liquidityProvisions,
      liquidityProvider,
      filter
    );
  }
);

export const matchFilter = (
  filter: Filter,
  lp: LiquidityProvisionFieldsFragment
) => {
  if (filter.partyId && lp.party.id !== filter.partyId) {
    return false;
  }
  if (
    filter.active === true &&
    lp.status !== Schema.LiquidityProvisionStatus.STATUS_ACTIVE
  ) {
    return false;
  }
  if (
    filter.active === false &&
    lp.status === Schema.LiquidityProvisionStatus.STATUS_ACTIVE
  ) {
    return false;
  }
  return true;
};

export interface LiquidityProvisionData
  extends Omit<LiquidityProvisionFieldsFragment, '__typename'> {
  assetDecimalPlaces?: number;
  balance?: string;
  averageEntryValuation?: string;
  equityLikeShare?: string;
}

export const getLiquidityProvision = (
  liquidityProvisions: LiquidityProvisionFieldsFragment[],
  liquidityProvider: LiquidityProviderFieldsFragment[],
  filter?: Filter
): LiquidityProvisionData[] => {
  return liquidityProvisions
    .filter((lp) => {
      if (
        ![
          Schema.LiquidityProvisionStatus.STATUS_ACTIVE,
          Schema.LiquidityProvisionStatus.STATUS_UNDEPLOYED,
          Schema.LiquidityProvisionStatus.STATUS_PENDING,
        ].includes(lp.status)
      ) {
        return false;
      }
      if (filter && !matchFilter(filter, lp)) {
        return false;
      }
      return true;
    })
    .map((lp) => {
      const lpObj = liquidityProvider.find((f) => lp.party.id === f.partyId);
      if (!lpObj) return lp;
      const accounts = compact(lp.party.accountsConnection?.edges).map(
        (e) => e.node
      );
      const bondAccounts = accounts?.filter(
        (a) => a?.type === Schema.AccountType.ACCOUNT_TYPE_BOND
      );
      const feeAccounts = accounts?.filter(
        (a) => a?.type === Schema.AccountType.ACCOUNT_TYPE_LP_LIQUIDITY_FEES
      );
      const balance =
        bondAccounts
          ?.reduce(
            (acc, a) => acc.plus(new BigNumber(a.balance ?? 0)),
            new BigNumber(0)
          )
          .toString() || '0';

      const earmarkedFees =
        feeAccounts
          ?.reduce(
            (acc, a) => acc.plus(new BigNumber(a.balance ?? 0)),
            new BigNumber(0)
          )
          .toString() || '0';
      return {
        ...lp,
        ...lpObj,
        balance,
        earmarkedFees,
        __typename: undefined,
      };
    });
};
