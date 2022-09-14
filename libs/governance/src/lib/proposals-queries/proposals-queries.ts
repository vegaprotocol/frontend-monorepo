import compact from 'lodash/compact';
import flow from 'lodash/flow';
import orderBy from 'lodash/orderBy';
import { Schema } from '@vegaprotocol/types';
import { getNodes } from '@vegaprotocol/react-helpers';

type ProposalsConnection = Pick<Schema.Query, 'proposalsConnection'>;
type Proposal = Partial<Schema.Proposal>;

const orderByDate = (arr: Proposal[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p?.terms?.enactmentDatetime || 0).getTime(), // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered.
      (p) => new Date(p?.terms?.closingDatetime || 0).getTime(),
      (p) => p.id,
    ],
    ['desc', 'desc', 'desc']
  );

export const getNotRejectedProposals = (data?: ProposalsConnection) => {
  const proposals = getNodes<Proposal>(
    data?.proposalsConnection,
    (node) => node?.state !== Schema.ProposalState.STATE_REJECTED
  );
  return flow([compact, orderByDate])(proposals);
};

export const getRejectedProposals = (data?: ProposalsConnection) => {
  const proposals = getNodes<Proposal>(
    data?.proposalsConnection,
    (node) => node?.state === Schema.ProposalState.STATE_REJECTED
  );
  return flow([compact, orderByDate])(proposals);
};
