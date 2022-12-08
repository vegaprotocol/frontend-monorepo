import compact from 'lodash/compact';
import filter from 'lodash/filter';
import flow from 'lodash/flow';
import orderBy from 'lodash/orderBy';
import * as Schema from '@vegaprotocol/types';

type Proposal = {
  __typename: 'Proposal';
  id: string | null;
  state: Schema.ProposalState;
  terms: {
    enactmentDatetime: string | null;
    closingDatetime: string;
  };
};
type ProposalEdge = {
  node: Proposal;
};
type ProposalEdges = {
  edges: (ProposalEdge | null)[] | null;
};
type ProposalsConnection = {
  proposalsConnection: ProposalEdges | null;
};

export const getProposals = (data?: ProposalsConnection) => {
  const proposals = data?.proposalsConnection?.edges
    ?.filter((e) => e?.node)
    .map((e) => e?.node);
  return proposals ? (proposals as Proposal[]) : [];
};

const orderByDate = (arr: Proposal[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p.terms.enactmentDatetime || 0).getTime(), // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered.
      (p) => new Date(p.terms.closingDatetime).getTime(),
      (p) => p.id,
    ],
    ['desc', 'desc', 'desc']
  );

export const getNotRejectedProposals = (data?: ProposalsConnection) => {
  const proposals = getProposals(data);
  return flow([
    compact,
    (arr: Proposal[]) =>
      filter(arr, ({ state }) => state !== Schema.ProposalState.STATE_REJECTED),
    orderByDate,
  ])(proposals);
};

export const getRejectedProposals = (data?: ProposalsConnection) => {
  const proposals = getProposals(data);
  return flow([
    compact,
    (arr: Proposal[]) =>
      filter(arr, ({ state }) => state === Schema.ProposalState.STATE_REJECTED),
    orderByDate,
  ])(proposals);
};
