import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getClosingTimestamp,
  useProposalSubmit,
  deadlineToRoundedHours,
} from '@vegaprotocol/governance';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  ProposalFormDescription,
  ProposalFormSubheader,
  ProposalFormSubmit,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  ProposalFormViewJson,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { ProposalMinRequirements } from '../../components/shared';
import { AsyncRenderer, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import {
  createDocsLinks,
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/react-helpers';
import { ProposalUserAction } from '../../components/shared';
import { viewJsonStringInNewWindow } from '../../../../lib/view-form-as-json-new-window';

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

  const { VEGA_DOCS_URL, VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
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
        newFreeform: {},
        closingTimestamp: getClosingTimestamp(
          fields.proposalVoteDeadline,
          isVoteDeadlineAtMinimum,
          isVoteDeadlineAtMaximum
        ),
      },
    };
  };

  const onSubmit = async (fields: FreeformProposalFormFields) => {
    await submit(assembleProposal(fields));
  };

  const viewJson = () => {
    const formData = watch();
    viewJsonStringInNewWindow(JSON.stringify(assembleProposal(formData)));
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={params}>
      <Heading title={t('NewFreeformProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalMinRequirements
              minProposalBalance={
                params.governance_proposal_freeform_minProposerBalance
              }
              spamProtectionMin={params.spam_protection_proposal_min_tokens}
              userAction={ProposalUserAction.CREATE}
            />

            {VEGA_DOCS_URL && (
              <p className="text-sm" data-testid="proposal-docs-link">
                <span className="mr-1">{t('ProposalTermsText')}</span>
                <ExternalLink
                  href={`${
                    createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE
                  }${DOCS_LINK}`}
                  target="_blank"
                >{`${
                  createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE
                }${DOCS_LINK}`}</ExternalLink>
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

                <ProposalFormSubmit isSubmitting={isSubmitting} />
                <ProposalFormViewJson viewJson={viewJson} />
                <ProposalFormTransactionDialog
                  finalizedProposal={finalizedProposal}
                  TransactionDialog={Dialog}
                />
              </form>
            </div>
          </>
        )}
      </VegaWalletContainer>
    </AsyncRenderer>
  );
};
