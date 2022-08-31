import { ProposalState } from '@vegaprotocol/types';
import { compact, filter, flow, orderBy } from 'lodash';

type Proposal = {
  __typename: 'Proposal';
  id: string | null;
  state: ProposalState;
  terms: {
    enactmentDatetime: string | null;
    closingDatetime: string;
  };
};
type ProposalEdge = {
  node: Proposal;
};
type ProposalsConnection = {
  proposalsConnection: {
    edges: (ProposalEdge | null)[] | null;
  };
};

export const getProposals = (data?: ProposalsConnection) => {
  const proposals = data?.proposalsConnection.edges
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
      filter(arr, ({ state }) => state !== ProposalState.STATE_REJECTED),
    orderByDate,
  ])(proposals);
};

export const getRejectedProposals = (data?: ProposalsConnection) => {
  const proposals = getProposals(data);
  return flow([
    compact,
    (arr: Proposal[]) =>
      filter(arr, ({ state }) => state === ProposalState.STATE_REJECTED),
    orderByDate,
  ])(proposals);
};
