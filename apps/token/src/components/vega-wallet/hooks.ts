import { gql, useQuery } from '@apollo/client';
import keyBy from 'lodash/keyBy';
import uniq from 'lodash/uniq';
import { useTranslation } from 'react-i18next';

import noIcon from '../../images/token-no-icon.png';
import vegaBlack from '../../images/vega_black.png';
import { BigNumber } from '../../lib/bignumber';
import { addDecimal } from '../../lib/decimals';
import type {
  Delegations,
  DelegationsVariables,
} from './__generated__/Delegations';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { isAssetTypeERC20, toBigNum } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import { usePartyDelegations } from './use-party-delegations';
import { useAppState } from '../../contexts/app-state/app-state-context';

const DELEGATIONS_QUERY = gql`
  query Delegations($partyId: ID!) {
    epoch {
      id
    }
    party(id: $partyId) {
      id
      stake {
        currentStakeAvailable
        currentStakeAvailableFormatted @client
      }
      accounts {
        asset {
          name
          id
          decimals
          symbol
          source {
            __typename
            ... on ERC20 {
              contractAddress
            }
          }
        }
        type
        balance
      }
    }
  }
`;

export const usePollForDelegations = () => {
  const {
    appState: { decimals },
  } = useAppState();
  const { token: vegaToken } = useContracts();
  const { t } = useTranslation();
  const { keypair } = useVegaWallet();
  const delegations = usePartyDelegations(keypair?.pub);

  const { data } = useQuery<Delegations, DelegationsVariables>(
    DELEGATIONS_QUERY,
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      variables: { partyId: keypair?.pub! },
      skip: !keypair?.pub,
    }
  );

  const filter =
    delegations?.filter((d) => {
      return d.epochSeq === data?.epoch.id;
    }) || [];
  const sortedDelegations = [...filter].sort((a, b) => {
    return new BigNumber(b.amount).minus(a.amount).toNumber();
  });

  const partyAccounts = data?.party?.accounts || [];
  const accounts = partyAccounts
    .filter((a) => a.type === AccountType.General)
    .map((a) => {
      const isVega =
        isAssetTypeERC20(a.asset) &&
        a.asset.source.contractAddress === vegaToken.address;

      return {
        isVega,
        name: a.asset.name,
        subheading: isVega ? t('collateral') : a.asset.symbol,
        symbol: a.asset.symbol,
        decimals: a.asset.decimals,
        balance: new BigNumber(
          addDecimal(new BigNumber(a.balance), a.asset.decimals)
        ),
        image: isVega ? vegaBlack : noIcon,
        border: isVega,
        address: isAssetTypeERC20(a.asset)
          ? a.asset.source.contractAddress
          : undefined,
      };
    })
    .sort((a, b) => {
      // Put VEGA at the top of the list
      if (a.isVega) {
        return -1;
      }
      if (b.isVega) {
        return 1;
      }
      // Secondary sort by name
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  const delegatedNextEpoch = keyBy(
    delegations?.filter((d) => {
      return Number(d.epochSeq) === Number(data?.epoch.id) + 1;
    }) || [],
    'nodeId'
  );
  const delegatedThisEpoch = keyBy(
    delegations?.filter((d) => {
      return d.epochSeq === data?.epoch.id;
    }) || [],
    'nodeId'
  );
  const nodesDelegated = uniq([
    ...Object.keys(delegatedNextEpoch),
    ...Object.keys(delegatedThisEpoch),
  ]);

  const delegatedAmounts = nodesDelegated
    .map((d) => ({
      nodeId: d,
      name:
        delegatedThisEpoch[d]?.node?.name || delegatedNextEpoch[d]?.node?.name,
      hasStakePending: !!(
        (delegatedThisEpoch[d]?.amount || delegatedNextEpoch[d]?.amount) &&
        delegatedThisEpoch[d]?.amount !== delegatedNextEpoch[d]?.amount &&
        delegatedNextEpoch[d] !== undefined
      ),
      currentEpochStake:
        delegatedThisEpoch[d] &&
        toBigNum(delegatedThisEpoch[d].amount, decimals),
      nextEpochStake:
        delegatedNextEpoch[d] &&
        toBigNum(delegatedNextEpoch[d].amount, decimals),
    }))
    .sort((a, b) => {
      if (
        new BigNumber(a.currentEpochStake || 0).isLessThan(
          b.currentEpochStake || 0
        )
      )
        return 1;
      if (
        new BigNumber(a.currentEpochStake || 0).isGreaterThan(
          b.currentEpochStake || 0
        )
      )
        return -1;
      if ((!a.name && b.name) || a.name || '' < (b.name || '')) return 1;
      if ((!b.name && a.name) || a.name || '' > (b.name || '')) return -1;
      if (a.nodeId > b.nodeId) return 1;
      if (a.nodeId < b.nodeId) return -1;
      return 0;
    });

  return {
    delegations: sortedDelegations,
    currentStakeAvailable: new BigNumber(
      data?.party?.stake.currentStakeAvailableFormatted || 0
    ),
    delegatedNodes: delegatedAmounts,
    accounts,
  };
};
