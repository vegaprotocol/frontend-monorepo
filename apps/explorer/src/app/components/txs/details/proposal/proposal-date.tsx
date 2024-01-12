import { t } from '@vegaprotocol/i18n';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import type { components } from '../../../../../types/explorer';
import type { ExplorerProposalStatusQuery } from './__generated__/Proposal';
import { useExplorerProposalStatusQuery } from './__generated__/Proposal';

type Terms = components['schemas']['vegaProposalTerms'];

export function format(date: string | undefined, def: string) {
  if (!date) {
    return def;
  }

  return new Date().toLocaleDateString() || def;
}

export function getDate(
  data: ExplorerProposalStatusQuery | undefined,
  terms: Terms
): string {
  const proposal = data?.proposal as Extract<
    ExplorerProposalStatusQuery['proposal'],
    { __typename?: 'Proposal' }
  >;

  const DEFAULT = t('Unknown');
  if (!proposal?.state) {
    return DEFAULT;
  }

  switch (proposal.state) {
    case 'STATE_DECLINED':
      return `${t('Rejected on')}: ${format(terms.closingTimestamp, DEFAULT)}`;
    case 'STATE_ENACTED':
      return `${t('Vote passed on')}: ${format(
        terms.enactmentTimestamp,
        DEFAULT
      )}`;
    case 'STATE_FAILED':
      return `${t('Failed on')}: ${format(terms.validationTimestamp, DEFAULT)}`;
    case 'STATE_OPEN':
      return `${t('Open until')}: ${format(terms.closingTimestamp, DEFAULT)}`;
    case 'STATE_PASSED':
      return `${t('Passed on')}: ${format(terms.closingTimestamp, DEFAULT)}`;
    case 'STATE_REJECTED':
      return `${t('Rejected on submission')}`;
    case 'STATE_WAITING_FOR_NODE_VOTE':
      return `${t('Opening')}...`;
    default:
      return DEFAULT;
  }
}

interface ProposalDateProps {
  id: string;
  terms: Terms;
}
/**
 * Shows the most relevant date for the proposal summary view. Depending on the
 * state returned by GraphQL, we show either the validation, closing or enactment
 * timestamp
 */
export const ProposalDate = ({ terms, id }: ProposalDateProps) => {
  const { data } = useExplorerProposalStatusQuery({
    variables: {
      id,
    },
  });

  return (
    <Lozenge className="font-sans text-xs float-right">
      {getDate(data, terms)}
    </Lozenge>
  );
};
