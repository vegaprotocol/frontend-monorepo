import flow from 'lodash/flow';
import orderBy from 'lodash/orderBy';
import type { PartialDeep } from 'type-fest';
import * as Schema from '@vegaprotocol/types';
import type {
  NodeConnection,
  NodeEdge,
} from '@vegaprotocol/react-helpers';
import { getNodes } from '@vegaprotocol/react-helpers';

type Proposal = PartialDeep<Schema.Proposal>;

const orderByDate = (arr: Proposal[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p?.terms?.enactmentDatetime || 0).getTime(), // has to be defaulted to 0 because new Date(null).getTime() -> NaN which is first when ordered.
      (p) => new Date(p?.terms?.closingDatetime).getTime(),
      (p) => p.id,
    ],
    ['desc', 'desc', 'desc']
  );

export function getNotRejectedProposals<T extends Proposal>(
  data?: NodeConnection<NodeEdge<T>> | null
): T[] {
  return flow([
    (data) =>
      getNodes<Proposal>(data?.proposalsConnection, (p) =>
        p ? p?.state !== Schema.ProposalState.STATE_REJECTED : false
      ),
    orderByDate,
  ])(data);
}

export function getRejectedProposals<T extends Proposal>(
  data?: NodeConnection<NodeEdge<Proposal>> | null
): T[] {
  return flow([
    (data) =>
      getNodes<Proposal>(data?.proposalsConnection, (p) =>
        p ? p?.state === Schema.ProposalState.STATE_REJECTED : false
      ),
    orderByDate,
  ])(data);
}
