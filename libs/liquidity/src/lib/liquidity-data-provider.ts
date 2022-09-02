import { gql, useQuery } from '@apollo/client';
import type { LiquidityProvisionStatus } from '@vegaprotocol/types';
import { AccountType } from '@vegaprotocol/types';
import { useNetworkParameter } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import { SISKA_NETWORK_PARAMETER } from './liquidity-manager';
import type {
  MarketLiquidity,
  MarketLiquidity_market_data_liquidityProviderFeeShare,
} from './__generated__';

const MARKET_LIQUIDITY_QUERY = gql`
  query MarketLiquidity($marketId: ID!, $partyId: String) {
    market(id: $marketId) {
      id
      decimalPlaces
      positionDecimalPlaces
      liquidityProvisionsConnection(party: $partyId) {
        edges {
          node {
            id
            party {
              id
              accountsConnection(marketId: $marketId, type: ACCOUNT_TYPE_BOND) {
                edges {
                  node {
                    type
                    balance
                  }
                }
              }
            }
            createdAt
            updatedAt
            commitmentAmount
            fee
            status
          }
        }
      }
      tradableInstrument {
        instrument {
          code
          product {
            ... on Future {
              settlementAsset {
                id
                symbol
                decimals
              }
            }
          }
        }
      }
      data {
        market {
          id
        }
        suppliedStake
        openInterest
        targetStake
        marketValueProxy
        liquidityProviderFeeShare {
          party {
            id
          }
          equityLikeShare
          averageEntryValuation
        }
      }
    }
  }
`;

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
}

export const useLiquidityProvision = ({
  marketId,
  partyId,
}: {
  partyId?: string;
  marketId?: string;
}) => {
  const { data: stakeToCcySiskas } = useNetworkParameter([
    SISKA_NETWORK_PARAMETER,
  ]);
  const stakeToCcySiska = stakeToCcySiskas && stakeToCcySiskas[0];
  const { data, loading, error } = useQuery<MarketLiquidity>(
    MARKET_LIQUIDITY_QUERY,
    {
      variables: { marketId },
    }
  );
  const liquidityProviders = (
    data?.market?.data?.liquidityProviderFeeShare || []
  )
    ?.filter(
      (p: MarketLiquidity_market_data_liquidityProviderFeeShare) =>
        !partyId || p.party.id === partyId
    ) // if partyId is provided, filter out other parties
    .map((provider: MarketLiquidity_market_data_liquidityProviderFeeShare) => {
      const liquidityProvisionConnection =
        data?.market?.liquidityProvisionsConnection.edges?.find(
          (e) => e?.node.party.id === provider.party.id
        );
      const balance =
        liquidityProvisionConnection?.node?.party.accountsConnection.edges?.reduce(
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
    assetDecimalPlaces:
      data?.market?.tradableInstrument.instrument.product.settlementAsset
        .decimals,
    symbol:
      data?.market?.tradableInstrument.instrument.product.settlementAsset
        .symbol,
  };
  return { data: liquidityData, loading, error };
};
