import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getClosingTimestamp,
  useProposalSubmit,
  deadlineToRoundedHours,
} from '@vegaprotocol/proposals';
import { useEnvironment, DocsLinks } from '@vegaprotocol/environment';
import {
  ProposalFormDescription,
  ProposalFormSubheader,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  ProposalFormDownloadJson,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { ProposalMinRequirements } from '../../components/shared';
import { AsyncRenderer, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { ProposalUserAction } from '../../components/shared';
import { downloadJson } from '../../../../lib/download-json';

export interface FreeformProposalFormFields {
  proposalVoteDeadline: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

const DOCS_LINK = '/freeform-proposal';

export const ProposeFreeform = () => {
  const { params, loading, error } = useNetworkParams([
    NetworkParams.governance_proposal_freeform_minClose,
    NetworkParams.governance_proposal_freeform_maxClose,
    NetworkParams.governance_proposal_freeform_minProposerBalance,
    NetworkParams.spam_protection_proposal_min_tokens,
  ]);
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<FreeformProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const assembleProposal = (fields: FreeformProposalFormFields) => {
    const isVoteDeadlineAtMinimum =
      fields.proposalVoteDeadline ===
      deadlineToRoundedHours(
        params.governance_proposal_freeform_minClose
      ).toString();

    const isVoteDeadlineAtMaximum =
      fields.proposalVoteDeadline ===
      deadlineToRoundedHours(
        params.governance_proposal_freeform_maxClose
      ).toString();

    return {
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        change: { newFreeform: {} },
        closingTimestamp: BigInt(
          getClosingTimestamp(
            fields.proposalVoteDeadline,
            isVoteDeadlineAtMinimum,
            isVoteDeadlineAtMaximum
          )
        ),
      },
    };
  };

  const onSubmit = async (fields: FreeformProposalFormFields) => {
    await submit(assembleProposal(fields));
  };

  const viewJson = async () => {
    const isValid = await trigger();

    if (!isValid) {
      return;
    }

    const formData = watch();
    downloadJson(
      JSON.stringify(assembleProposal(formData)),
      'vega-freeform-proposal'
    );
  };

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={params}
      render={(params) => (
        <>
          <Heading title={t('NewFreeformProposal')} />

          <ProposalMinRequirements
            minProposalBalance={
              params.governance_proposal_freeform_minProposerBalance
            }
            spamProtectionMin={params.spam_protection_proposal_min_tokens}
            userAction={ProposalUserAction.CREATE}
          />

          {DocsLinks && (
            <p className="text-sm" data-testid="proposal-docs-link">
              <span className="mr-1">{t('ProposalTermsText')}</span>
              <ExternalLink
                href={`${DocsLinks.PROPOSALS_GUIDE}${DOCS_LINK}`}
                target="_blank"
              >{`${DocsLinks.PROPOSALS_GUIDE}${DOCS_LINK}`}</ExternalLink>
            </p>
          )}

          {VEGA_EXPLORER_URL && (
            <p className="text-sm">
              {t('MoreProposalsInfo')}{' '}
              <ExternalLink
                href={`${VEGA_EXPLORER_URL}/governance`}
                target="_blank"
              >{`${VEGA_EXPLORER_URL}/governance`}</ExternalLink>
            </p>
          )}

          <div data-testid="freeform-proposal-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              <ProposalFormSubheader>
                {t('ProposalRationale')}
              </ProposalFormSubheader>

              <ProposalFormTitle
                registerField={register('proposalTitle', {
                  required: t('Required'),
                })}
                errorMessage={errors?.proposalTitle?.message}
              />
              <ProposalFormDescription
                registerField={register('proposalDescription', {
                  required: t('Required'),
                })}
                errorMessage={errors?.proposalDescription?.message}
              />

              <ProposalFormVoteAndEnactmentDeadline
                onVoteMinMax={setValue}
                voteRegister={register('proposalVoteDeadline', {
                  required: t('Required'),
                })}
                voteErrorMessage={errors?.proposalVoteDeadline?.message}
                voteMinClose={params.governance_proposal_freeform_minClose}
                voteMaxClose={params.governance_proposal_freeform_maxClose}
              />

              <ProposalFormDownloadJson downloadJson={viewJson} />
              <ProposalFormTransactionDialog
                finalizedProposal={finalizedProposal}
                TransactionDialog={Dialog}
              />
            </form>
          </div>
        </>
      )}
    />
  );
};
