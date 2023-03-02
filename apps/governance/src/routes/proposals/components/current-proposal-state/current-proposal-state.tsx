import { useTranslation } from 'react-i18next';
import * as Schema from '@vegaprotocol/types';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

export const CurrentProposalState = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}) => {
  const { t } = useTranslation();
  let className = 'text-white';

  if (
    proposal?.state === Schema.ProposalState.STATE_DECLINED ||
    proposal?.state === Schema.ProposalState.STATE_FAILED ||
    proposal?.state === Schema.ProposalState.STATE_REJECTED
  ) {
    className = 'text-danger';
  } else if (
    proposal?.state === Schema.ProposalState.STATE_ENACTED ||
    proposal?.state === Schema.ProposalState.STATE_PASSED
  ) {
    className = 'text-white';
  }
  return <span className={className}>{t(`${proposal?.state}`)}</span>;
};
