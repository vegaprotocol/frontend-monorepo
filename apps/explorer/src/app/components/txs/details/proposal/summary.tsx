import { useState } from 'react';
import { JsonViewerDialog } from '../../../dialogs/json-viewer-dialog';
import ProposalLink from '../../../links/proposal-link/proposal-link';
import truncate from 'lodash/truncate';
import { ProposalStatusIcon } from './proposal-status-icon';
import ReactMarkdown from 'react-markdown';
import { ProposalDate } from './proposal-date';
import { t } from '@vegaprotocol/i18n';

import type { ProposalTerms } from '../tx-proposal';
import type { components } from '../../../../../types/explorer';
import { BatchItem } from './batch-item';

type Rationale = components['schemas']['vegaProposalRationale'];
type Batch = components['schemas']['v1BatchProposalSubmissionTerms']['changes'];

type ProposalTermsDialog = {
  open: boolean;
  title: string;
  content: unknown;
};

interface ProposalSummaryProps {
  id: string;
  rationale?: Rationale;
  terms?: ProposalTerms;
  batch?: Batch;
}

/**
 * Effectively a 'preview' for what the proposal is about, and a link to the
 * Token site for full breakdown of votes
 */
export const ProposalSummary = ({
  id,
  rationale,
  terms,
  batch,
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
      {rationale?.title && (
        <h1 className="text-xl pb-1 break-word">{rationale.title}</h1>
      )}
      {rationale?.description && (
        <div className="pt-2 text-sm leading-tight">
          <ReactMarkdown
            className="react-markdown-container"
            skipHtml={true}
            disallowedElements={['img']}
            linkTarget="_blank"
          >
            {md}
          </ReactMarkdown>
        </div>
      )}
      {batch && (
        <section className="pt-2 text-sm leading-tight my-3">
          <h2 className="text-lg pb-1">{t('Changes')}</h2>
          <ol>
            {batch.map((change, index) => (
              <li className="ml-4 list-decimal my-2" key={`batch-${index}`}>
                <BatchItem item={change} />
              </li>
            ))}
          </ol>
        </section>
      )}
      <div className="pt-5">
        <button className="underline max-md:hidden mr-5" onClick={openDialog}>
          {t('View terms')}
        </button>{' '}
        <ProposalLink id={id} text={t('Full details')} />
        {terms && <ProposalDate terms={terms} id={id} />}
      </div>
      <JsonViewerDialog
        open={dialog.open}
        onChange={(isOpen) => setDialog({ ...dialog, open: isOpen })}
        title={dialog.title}
        content={dialog.content}
      />
    </div>
  );
};
