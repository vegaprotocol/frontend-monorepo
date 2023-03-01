import type { ProposalTerms } from '../tx-proposal';
import { useState } from 'react';
import type { components } from '../../../../../types/explorer';
import { JsonViewerDialog } from '../../../dialogs/json-viewer-dialog';
import ProposalLink from '../../../links/proposal-link/proposal-link';
import truncate from 'lodash/truncate';
import { ProposalStatusIcon } from './proposal-status-icon';
import ReactMarkdown from 'react-markdown';
import { ProposalDate } from './proposal-date';
import { t } from '@vegaprotocol/i18n';

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

  const md =
    rationale && rationale.description
      ? truncate(rationale.description, {
          // Limits the description to roughly 5 lines, maximum
          length: 350,
        })
      : '';

  return (
    <div className="w-auto max-w-lg border-2 border-solid border-vega-light-100 dark:border-vega-dark-200 p-5">
      {id && <ProposalStatusIcon id={id} />}
      {rationale?.title && <h1 className="text-xl pb-1">{rationale.title}</h1>}
      {rationale?.description && (
        <p className="pt-2 text-sm leading-tight">
          <ReactMarkdown
            className="react-markdown-container"
            skipHtml={true}
            disallowedElements={['img']}
            linkTarget="_blank"
          >
            {md}
          </ReactMarkdown>
        </p>
      )}
      <p className="pt-5">
        <button className="underline max-md:hidden mr-5" onClick={openDialog}>
          {t('View terms')}
        </button>{' '}
        <ProposalLink id={id} text={t('Full details')} />
        {terms && <ProposalDate terms={terms} id={id} />}
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
