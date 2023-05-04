import { addSeconds, millisecondsToSeconds } from 'date-fns';
import type { ProposalSubmissionBody } from '@vegaprotocol/wallet';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { upgradeProposalsData } from '../fixtures/mocks/network-upgrade';
import { proposalsData } from '../fixtures/mocks/proposals';
import { nodeData } from '../fixtures/mocks/nodes';

export function createUpdateNetworkProposalTxBody(): ProposalSubmissionBody {
  const MIN_CLOSE_SEC = 5;
  const MIN_ENACT_SEC = 7;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const enactmentDate = addSeconds(closingDate, MIN_ENACT_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  const enactmentTimestamp = millisecondsToSeconds(enactmentDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'Add New proposal with short enactment',
        description: 'E2E enactment test',
      },
      terms: {
        updateNetworkParameter: {
          changes: {
            key: 'governance.proposal.updateNetParam.minProposerBalance',
            value: '2',
          },
        },
        closingTimestamp,
        enactmentTimestamp,
      },
    },
  };
}

export function createUpdateAssetProposalTxBody(): ProposalSubmissionBody {
  const MIN_CLOSE_SEC = 5;
  const MIN_ENACT_SEC = 7;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const enactmentDate = addSeconds(closingDate, MIN_ENACT_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  const enactmentTimestamp = millisecondsToSeconds(enactmentDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'Update Asset set to fail',
        description: 'E2E fail test',
      },
      terms: {
        updateAsset: {
          assetId:
            'ebcd94151ae1f0d39a4bde3b21a9c7ae81a80ea4352fb075a92e07608d9c953d',
          changes: {
            quantum: '1',
            erc20: {
              withdrawThreshold: '10',
              lifetimeLimit: '10',
            },
          },
        },
        closingTimestamp,
        enactmentTimestamp,
      },
    },
  };
}

export function createFreeFormProposalTxBody(): ProposalSubmissionBody {
  const MIN_CLOSE_SEC = 7;

  const closingDate = addSeconds(new Date(), MIN_CLOSE_SEC);
  const closingTimestamp = millisecondsToSeconds(closingDate.getTime());
  return {
    proposalSubmission: {
      rationale: {
        title: 'Add New free form proposal with short enactment',
        description: 'E2E enactment test',
      },
      terms: {
        newFreeform: {},
        closingTimestamp,
      },
    },
  };
}

export function mockNetworkUpgradeProposal() {
  cy.mockGQL((req) => {
    aliasGQLQuery(req, 'Nodes', nodeData);
    aliasGQLQuery(req, 'Proposals', proposalsData);
    aliasGQLQuery(req, 'ProtocolUpgradeProposals', upgradeProposalsData);
  });
}
