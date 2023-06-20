import type { Value as ProtoOrderTypeValue } from '@vegaprotocol/protos/dist/vega/Vote/Value';
import { createLog } from './logging';
import { sendVegaTx } from './wallet-client';

const log = createLog('vote');

export async function vote(
  proposalId: string,
  voteValue: ProtoOrderTypeValue,
  publicKey: string
) {
  log(`voting ${voteValue} on ${proposalId}`);

  const voteTx = createVote(proposalId, voteValue);
  const voteResult = await sendVegaTx(publicKey, voteTx);

  return voteResult.result;
}

function createVote(proposalId: string, value: ProtoOrderTypeValue) {
  return {
    voteSubmission: {
      value,
      proposalId,
    },
  };
}
