import compact from 'lodash/compact';
import { ENV } from '../../../../config';
import { useEffect, useState } from 'react';

type Maybe<T> = T | null | undefined;

type ProposalState =
  | 'STATE_UNSPECIFIED'
  | 'STATE_FAILED'
  | 'STATE_OPEN'
  | 'STATE_PASSED'
  | 'STATE_REJECTED'
  | 'STATE_DECLINED'
  | 'STATE_ENACTED'
  | 'STATE_WAITING_FOR_NODE_VOTE';

type ProposalType =
  | 'TYPE_UNSPECIFIED'
  | 'TYPE_ALL'
  | 'TYPE_NEW_MARKET'
  | 'TYPE_UPDATE_MARKET'
  | 'TYPE_NETWORK_PARAMETERS'
  | 'TYPE_NEW_ASSET'
  | 'TYPE_NEW_FREE_FORM'
  | 'TYPE_UPDATE_ASSET'
  | 'TYPE_NEW_SPOT_MARKET'
  | 'TYPE_UPDATE_SPOT_MARKET'
  | 'TYPE_NEW_TRANSFER'
  | 'TYPE_CANCEL_TRANSFER'
  | 'TYPE_UPDATE_MARKET_STATE'
  | 'TYPE_UPDATE_REFERRAL_PROGRAM'
  | 'TYPE_UPDATE_VOLUME_DISCOUNT_PROGRAM';

type ProposalNodeType = 'TYPE_SINGLE_OR_UNSPECIFIED' | 'TYPE_BATCH';

type ProposalData = {
  id: string;
  rationale: {
    description: string;
    title: string;
  };
  state: ProposalState;
  timestamp: string;
  requiredMajority: string;
  requiredParticipation: string;
  requiredLiquidityProviderMajority: string;
  requiredLiquidityProviderParticipation: string;
  batchTerms?: {
    proposalParams?: {
      requiredMajority: string;
      requiredParticipation: string;
    };
  };
};

type Terms = {
  cancelTransfer?: { changes: unknown };
  enactmentTimestamp: string;
  newAsset?: { changes: unknown };
  newFreeform: object;
  newMarket?: { changes: unknown };
  newSpotMarket?: { changes: unknown };
  newTransfer?: { changes: unknown };
  updateAsset?: { assetId: string; changes: unknown };
  updateMarket?: { marketId: string; changes: unknown };
  updateMarketState?: {
    changes: {
      marketId: string;
      price: string;
      updateType:
        | 'MARKET_STATE_UPDATE_TYPE_UNSPECIFIED'
        | 'MARKET_STATE_UPDATE_TYPE_TERMINATE'
        | 'MARKET_STATE_UPDATE_TYPE_SUSPEND'
        | 'MARKET_STATE_UPDATE_TYPE_RESUME';
    };
  };
  updateNetworkParameter?: { changes: unknown };
  updateReferralProgram?: { changes: unknown };
  updateSpotMarket?: { marketId: string; changes: unknown };
  updateVolumeDiscountProgram?: { changes: unknown };
};

export type SingleProposalData = ProposalData & {
  terms: Terms & {
    closingTimestamp: string;
    validationTimestamp: string;
  };
};

type BatchProposalData = ProposalData & {
  batchTerms: {
    changes: Terms[];
  };
};

export type SubProposalData = SingleProposalData & {
  batchId: string;
};

export type ProposalNode = {
  proposal: ProposalData;
  proposalType: ProposalNodeType;
  proposals: SubProposalData[];
  yes?: [
    {
      partyId: string;
      elsPerMarket?: [
        {
          marketId: string;
          els: string;
        }
      ];
    }
  ];
  no?: [
    {
      partyId: string;
      elsPerMarket?: [
        {
          marketId: string;
          els: string;
        }
      ];
    }
  ];
};

type SingleProposalNode = ProposalNode & {
  proposal: SingleProposalData;
  proposalType: 'TYPE_SINGLE_OR_UNSPECIFIED';
  proposals: [];
};

type BatchProposalNode = ProposalNode & {
  proposal: BatchProposalData;
  proposalType: 'TYPE_BATCH';
};

export const isProposalNode = (node: unknown): node is ProposalNode =>
  Boolean(
    typeof node === 'object' &&
      node &&
      'proposal' in node &&
      typeof node.proposal === 'object' &&
      node?.proposal &&
      'id' in node.proposal &&
      node?.proposal?.id
  );

export const isSingleProposalNode = (
  node: Maybe<ProposalNode>
): node is SingleProposalNode =>
  Boolean(
    node &&
      node?.proposalType === 'TYPE_SINGLE_OR_UNSPECIFIED' &&
      node?.proposal
  );

export const isBatchProposalNode = (
  node: Maybe<ProposalNode>
): node is BatchProposalNode =>
  Boolean(
    node &&
      node?.proposalType === 'TYPE_BATCH' &&
      node?.proposal &&
      'batchTerms' in node.proposal &&
      node?.proposals?.length > 0
  );

// this includes also batch proposals with `updateMarket`s 👍
const PROPOSALS_ENDPOINT = `${ENV.rest}governances?proposalState=:proposalState&proposalType=:proposalType`;

// this can be queried also by sub proposal id as `proposalId` and it will
// return full batch proposal data with all of its sub proposals including
// the requested one inside `proposals` array.
const PROPOSAL_ENDPOINT = `${ENV.rest}governance?proposalId=:proposalId`;

export const getProposals = async ({
  proposalState,
  proposalType,
}: {
  proposalState: ProposalState;
  proposalType: ProposalType;
}) => {
  try {
    const response = await fetch(
      PROPOSALS_ENDPOINT.replace(':proposalState', proposalState).replace(
        ':proposalType',
        proposalType
      )
    );
    if (response.ok) {
      const data = await response.json();
      if (
        data &&
        'connection' in data &&
        data.connection &&
        'edges' in data.connection &&
        data.connection.edges?.length > 0
      ) {
        const nodes = compact(
          data.connection.edges.map((e: { node?: object }) => e?.node)
        ).filter(isProposalNode);

        return nodes;
      }
    }
  } catch {
    // NOOP - ignore errors
  }

  return [];
};

export const getProposal = async ({ proposalId }: { proposalId: string }) => {
  try {
    const response = await fetch(
      PROPOSAL_ENDPOINT.replace(':proposalId', proposalId)
    );
    if (response.ok) {
      const data = await response.json();
      if (data && 'data' in data && isProposalNode(data.data)) {
        return data.data as ProposalNode;
      }
    }
  } catch (err) {
    // NOOP - ignore errors
  }
  return null;
};

export const useFetchProposal = ({ proposalId }: { proposalId?: string }) => {
  const [data, setData] = useState<ProposalNode | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const cb = async () => {
      if (!proposalId) return;

      setLoading(true);
      const data = await getProposal({ proposalId });
      setLoading(false);
      if (data) {
        setData(data);
      }
    };
    cb();
  }, [proposalId]);

  return { data, loading };
};

export const useFetchProposals = ({
  proposalState,
  proposalType,
}: {
  proposalState: ProposalState;
  proposalType: ProposalType;
}) => {
  const [data, setData] = useState<ProposalNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const cb = async () => {
      setLoading(true);
      const data = await getProposals({ proposalState, proposalType });
      setLoading(false);
      if (data) {
        setData(data);
      }
    };
    cb();
  }, [proposalState, proposalType]);

  return { data, loading };
};

export const flatten = (
  nodes: ProposalNode[]
): (SingleProposalData | SubProposalData)[] => {
  const flattenNodes = [];
  for (const node of nodes) {
    if (isSingleProposalNode(node)) {
      flattenNodes.push(node.proposal);
    }
    if (isBatchProposalNode(node)) {
      for (const sub of node.proposals) {
        flattenNodes.push(sub);
      }
    }
  }
  return flattenNodes;
};
