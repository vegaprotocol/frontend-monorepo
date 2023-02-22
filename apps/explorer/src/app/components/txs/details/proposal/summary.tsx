import { t } from '@vegaprotocol/react-helpers';
import type { ProposalTerms } from '../tx-proposal';
import { useState } from 'react';
import type { components } from '../../../../../types/explorer';
import { JsonViewerDialog } from '../../../dialogs/json-viewer-dialog';
import ProposalLink from '../../../links/proposal-link/proposal-link';
import truncate from 'lodash/truncate';

type Rationale = components['schemas']['vegaProposalRationale'];

type ProposalTermsDialog = {
  open: boolean;
  title: string;
  content: unknown;
};

interface ProposalSummaryProps {
  id: string;
  rationale?: Rationale;
  terms?: ProposalTerms;
}

/**
 * Effectively a 'preview' for what the proposal is about, and a link to the
 * Token site for full breakdown of votes
 */
export const ProposalSummary = ({
  id,
  rationale,
  terms,
}: ProposalSummaryProps) => {
  const [dialog, setDialog] = useState<ProposalTermsDialog>({
    open: false,
    title: '',
    content: null,
  });

  const openDialog = () => {
    if (!terms) return;
    setDialog({
      open: true,
      title: rationale?.title || t('Proposal details'),
      content: terms ? terms : {},
    });
  };

  return (
    <div className="w-auto max-w-lg border-2 border-solid border-vega-light-100 dark:border-vega-dark-200 p-5">
      {rationale?.title && <h1 className="text-xl pb-3">{rationale.title}</h1>}
      {rationale?.description && (
        <p className="pt-2 text-sm leading-tight">
          {truncate(rationale.description, {
            // Limits the description to roughly 5 lines, maximum
            length: 350,
          })}
        </p>
      )}
      <p className="pt-5">
        <button className="underline max-md:hidden mr-5" onClick={openDialog}>
          {t('View terms')}
        </button>{' '}
        <ProposalLink id={id} text={t('Full details')} />
      </p>
      <JsonViewerDialog
        open={dialog.open}
        onChange={(isOpen) => setDialog({ ...dialog, open: isOpen })}
        title={dialog.title}
        content={dialog.content}
      />
    </div>
  );
};
