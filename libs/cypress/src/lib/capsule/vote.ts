import type * as Schema from '@vegaprotocol/types';
import { createLog } from './logging';
import { sendVegaTx } from './wallet-client';

const log = createLog('vote');

export async function vote(
  proposalId: string,
  voteValue: Schema.VoteValue,
  publicKey: string
) {
  log(`voting ${voteValue} on ${proposalId}`);

  const voteTx = createVote(proposalId, voteValue);
  const voteResult = await sendVegaTx(publicKey, voteTx);

  return voteResult.result;
}

function createVote(proposalId: string, value: Schema.VoteValue) {
  return {
    voteSubmission: {
      value,
      proposalId,
    },
  };
}
