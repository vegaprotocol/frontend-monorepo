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

  LiquidityProviderFieldsFragment,
  LiquidityProvidersQuery,
  LiquidityProvidersQueryVariables,
  LiquidityProvisionsQuery,
  LiquidityProvisionsQueryVariables} from './__generated__/MarketLiquidity';
import type {
  LiquidityProvisionFieldsFragment
} from './__generated__/MarketLiquidity';

export type LiquidityProvisionFields = LiquidityProvisionFieldsFragment &
  Schema.LiquiditySLAParameters & {
    currentCommitmentAmount?: string;
    currentFee?: string;
  };

export const liquidityProvisionsDataProvider = makeDataProvider<
  LiquidityProvisionsQuery,
  LiquidityProvisionFields[],
  never,
  never,
  LiquidityProvisionsQueryVariables
>({
  query: LiquidityProvisionsDocument,
  getData: (responseData: LiquidityProvisionsQuery | null) => {
    return (responseData?.market?.liquidityProvisions?.edges
      ?.filter((n) => !!n)
      .map((e) => {
        let node;
        if (!e?.node.pending && e?.node.current) {
          node = {
            ...e?.node.current,
            ...responseData.market?.liquiditySLAParameters,
          };
        } else if (!e?.node.current && e?.node.pending) {
          node = {
            ...e?.node.pending,
            ...responseData.market?.liquiditySLAParameters,
          };
        } else {
          node = {
            ...e?.node.pending,
            currentCommitmentAmount: e?.node.current.commitmentAmount,
            currentFee: e?.node.current.fee,
            ...responseData.market?.liquiditySLAParameters,
          };
        }
        return node;
      }) ?? []) as LiquidityProvisionFields[];
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

export const matchFilter = (filter: Filter, lp: LiquidityProvisionData) => {
  if (filter.partyId && lp.party.id !== filter.partyId) {
    return false;
  }
  if (
    filter.active === true &&
    lp.status !== Schema.LiquidityProvisionStatus.STATUS_ACTIVE &&
    lp.status !== Schema.LiquidityProvisionStatus.STATUS_PENDING
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
  extends Omit<LiquidityProvisionFields, '__typename'>,
    Partial<LiquidityProviderFieldsFragment>,
    Omit<Schema.LiquiditySLAParameters, '__typename'> {
  assetDecimalPlaces?: number;
  balance?: number;
  averageEntryValuation?: string;
  equityLikeShare?: string;
  earmarkedFees?: number;
  status: Schema.LiquidityProvisionStatus;
}

export const getLiquidityProvision = (
  liquidityProvisions: LiquidityProvisionFields[],
  liquidityProviders: LiquidityProviderFieldsFragment[],
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
    .map((liquidityProvision) => {
      const liquidityProvider = liquidityProviders.find(
        (f) => liquidityProvision.party.id === f.partyId
      );

      if (!liquidityProvider) {
        return {
          ...liquidityProvision,
          partyId: liquidityProvision.party.id,
        };
      }

      const accounts = compact(
        liquidityProvision.party.accountsConnection?.edges
      ).map((e) => e.node);
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
          .toNumber() ?? 0;

      const earmarkedFees =
        feeAccounts
          ?.reduce(
            (acc, a) => acc.plus(new BigNumber(a.balance ?? 0)),
            new BigNumber(0)
          )
          .toNumber() ?? 0;
      return {
        ...liquidityProvision,
        ...liquidityProvider,
        balance,
        earmarkedFees,
        __typename: undefined,
      };
    });
};
