import { update } from './proposals-data-provider';
import type {
  MarketViewProposalFieldsFragment,
  MarketViewProposalsQueryVariables,
} from './__generated__/Proposals';
import * as Types from '@vegaprotocol/types';

describe('proposals data provider', () => {
  const proposal = {
    id: '1',
    state: Types.ProposalState.STATE_OPEN,
    terms: {
      change: {
        __typename: 'UpdateMarketState',
      },
    },
  } as MarketViewProposalFieldsFragment;
  const data = [proposal];
  const delta = { ...proposal };
  const reload = jest.fn();

  const variables: MarketViewProposalsQueryVariables = {
    inState: Types.ProposalState.STATE_OPEN,
    proposalType: Types.ProposalType.TYPE_UPDATE_MARKET_STATE,
  };

  it('update existing data', () => {
    expect(update(data, delta, reload, variables)?.[0]).toBe(delta);
  });

  it('removes existing data if delta do not match inState', () => {
    expect(
      update(
        data,
        { ...delta, state: Types.ProposalState.STATE_PASSED },
        reload,
        variables
      )?.length
    ).toBe(0);
  });

  it('do not add delta if it do not match inState', () => {
    expect(
      update(
        data,
        { ...delta, id: '2', state: Types.ProposalState.STATE_PASSED },
        reload,
        variables
      )?.length
    ).toBe(1);
  });

  it('do not add delta if it do not match proposalType', () => {
    expect(
      update(
        data,
        {
          ...delta,
          id: '2',
          terms: { ...delta.terms, change: { __typename: 'UpdateMarket' } },
        },
        reload,
        variables
      )?.length
    ).toBe(1);
  });
});
