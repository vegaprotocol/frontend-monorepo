import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import type { IconProps } from '@vegaprotocol/ui-toolkit';
import { useExplorerProposalStatusQuery } from './__generated__/Proposal';
import type { ExplorerProposalStatusQuery } from './__generated__/Proposal';
import { t } from '@vegaprotocol/i18n';

interface ProposalStatusIconProps {
  id: string;
}

type IconAndLabel = {
  icon: IconProps['name'];
  label: string;
};

/**
 * Select an icon for a given query result. Tolerates queries that don't return
 * any data
 *
 * @param data a data result from useExplorerProposalStatusQuery
 * @returns Icon name
 */
export function useIconAndLabelForStatus(id: string): IconAndLabel {
  const { data, loading, error } = useExplorerProposalStatusQuery({
    variables: {
      id,
    },
  });

  const proposal = data?.proposal as Extract<
    ExplorerProposalStatusQuery['proposal'],
    { __typename?: 'Proposal' }
  >;

  const DEFAULT: IconAndLabel = {
    icon: 'error',
    label: t('Proposal state unknown'),
  };

  if (loading) {
    return {
      icon: 'more',
      label: t('Loading data'),
    };
  }

  if (!data?.proposal || error) {
    return {
      icon: 'error',
      label: error?.message || DEFAULT.label,
    };
  }

  switch (proposal.state) {
    case 'STATE_DECLINED':
      return {
        icon: 'stop',
        label: t('Proposal did not have enough participation to be valid'),
      };
    case 'STATE_ENACTED':
      return {
        icon: 'tick-circle',
        label: t('Vote passed and the proposal has been enacted'),
      };
    case 'STATE_FAILED':
      return {
        icon: 'thumbs-down',
        label: t('Proposal became invalid and was not processed'),
      };
    case 'STATE_OPEN':
      return {
        // A checklist to indicate in progress
        icon: 'form',
        label: t('Voting is in progress'),
      };
    case 'STATE_PASSED':
      return {
        icon: 'thumbs-up',
        label: t(
          'Voting is complete and this proposal was approved. It is not yet enacted.'
        ),
      };
    case 'STATE_REJECTED':
      return {
        icon: 'disable',
        label: t('The proposal was invalid'),
      };
    case 'STATE_WAITING_FOR_NODE_VOTE':
      return {
        // A sparkly thing indicating it's new
        icon: 'clean',
        label: t('Proposal is being checked by validators'),
      };
    default:
      return DEFAULT;
  }
}

/**
 */
export const ProposalStatusIcon = ({ id }: ProposalStatusIconProps) => {
  const { icon, label } = useIconAndLabelForStatus(id);

  return (
    <div className="float-left mr-3">
      <Tooltip description={<p>{label}</p>}>
        <div>
          <Icon name={icon} />
        </div>
      </Tooltip>
    </div>
  );
};
