import merge from 'lodash/merge';
import type { PartyAssetsQuery } from './__generated__/Assets';
import * as Types from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

export const partyAssetsQuery = (
  override?: PartialDeep<PartyAssetsQuery>
): PartyAssetsQuery => {
  const defaultAssets: PartyAssetsQuery = {
    party: {
      __typename: 'Party',
      id: 'partyId',
      accountsConnection: {
        edges: partyAccountFields.map((node) => ({
          __typename: 'AccountEdge',
          node,
        })),
      },
    },
  };
  return merge(defaultAssets, override);
};

const partyAccountFields = [
  {
    __typename: 'AccountBalance',
    type: Types.AccountType.ACCOUNT_TYPE_MARGIN,
    asset: {
      __typename: 'Asset',
      id: 'asset-id',
      symbol: 'tEURO',
      name: 'Euro',
      status: Types.AssetStatus.STATUS_ENABLED,
    },
  },
  {
    __typename: 'AccountBalance',
    type: Types.AccountType.ACCOUNT_TYPE_MARGIN,
    asset: {
      __typename: 'Asset',
      id: 'asset-id-2',
      symbol: 'tDAI',
      name: 'DAI',
      status: Types.AssetStatus.STATUS_ENABLED,
    },
  },
] as const;
