import { useTranslation } from 'react-i18next';
import * as Schema from '@vegaprotocol/types';
import { Intent, Lozenge } from '@vegaprotocol/ui-toolkit';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

export const CurrentProposalState = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}) => {
  const { t } = useTranslation();
  let intent = undefined;

  if (proposal?.state === Schema.ProposalState.STATE_OPEN) {
    intent = Intent.None;
  }

  // if (
  //   proposal?.state === Schema.ProposalState.STATE_DECLINED ||
  //   proposal?.state === Schema.ProposalState.STATE_FAILED ||
  //   proposal?.state === Schema.ProposalState.STATE_REJECTED
  // ) {
  //   intent = Intent.Danger;
  // }
  //
  // if (proposal?.state === Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE) {
  //   intent = Intent.Warning;
  // }
  //
  // if (
  //   proposal?.state === Schema.ProposalState.STATE_ENACTED ||
  //   proposal?.state === Schema.ProposalState.STATE_PASSED
  // ) {
  //   intent = Intent.Success;
  // }

  // All other statuses are now not displayed with Intent settings

  return (
    <Lozenge variant={intent} className="font-alpha">
      {t(`${proposal?.state}`)}
    </Lozenge>
  );
};
