import orderBy from 'lodash/orderBy';
import { Schema } from '@vegaprotocol/types';
import { getNodes } from '@vegaprotocol/react-helpers';
import {
  ProposalsQuery,
  ProposalFieldsFragment,
} from '@vegaprotocol/governance';

export const orderByDate = (arr: ProposalFieldsFragment[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p?.terms?.enactmentDatetime || 0).getTime(), // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered.
      (p) => new Date(p?.terms?.closingDatetime || 0).getTime(),
      (p) => p.id,
    ],
    ['desc', 'desc', 'desc']
  );

export function getNotRejectedProposals(data?: ProposalsQuery) {
  const proposals = getNodes<ProposalFieldsFragment>(
    data?.proposalsConnection,
    (node) => node?.state !== Schema.ProposalState.STATE_REJECTED
  );
  return orderByDate(proposals);
}

export function getRejectedProposals(data?: ProposalsQuery) {
  const proposals = getNodes<ProposalFieldsFragment>(
    data?.proposalsConnection,
    (node) => node?.state === Schema.ProposalState.STATE_REJECTED
  );
  return orderByDate(proposals);
}
