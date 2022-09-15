import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getClosingTimestamp,
  useProposalSubmit,
} from '@vegaprotocol/governance';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  ProposalFormSubheader,
  ProposalFormMinRequirements,
  ProposalFormTitle,
  ProposalFormDescription,
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { AsyncRenderer, Link } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import type { ProposalFreeformTerms } from '@vegaprotocol/wallet';
import { useNetworkParams, NetworkParams } from '@vegaprotocol/react-helpers';

export interface FreeformProposalFormFields {
  proposalVoteDeadline: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

const docsLink = 'freeform-proposal';

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
  } = useForm<FreeformProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const onSubmit = async (fields: FreeformProposalFormFields) => {
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newFreeform: {},
        closingTimestamp: getClosingTimestamp(fields.proposalVoteDeadline),
      },
    });
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={params}>
      <Heading title={t('NewFreeformProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements
              minProposerBalance={
                params.governance_proposal_freeform_minProposerBalance
              }
              spamProtectionMin={params.spam_protection_proposal_min_tokens}
            />

            {VEGA_DOCS_URL && (
              <p className="text-sm">
                <span className="mr-1">{t('ProposalTermsText')}</span>
                <Link
                  href={`${VEGA_DOCS_URL}/tutorials/proposals/${docsLink}`}
                  target="_blank"
                >{`${VEGA_DOCS_URL}/tutorials/proposals/${docsLink}`}</Link>
              </p>
            )}

            {VEGA_EXPLORER_URL && (
              <p className="text-sm">
                {t('MoreProposalsInfo')}{' '}
                <Link
                  href={`${VEGA_EXPLORER_URL}/governance`}
                  target="_blank"
                >{`${VEGA_EXPLORER_URL}/governance`}</Link>
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
                  voteRegister={register('proposalVoteDeadline', {
                    required: t('Required'),
                  })}
                  voteErrorMessage={errors?.proposalVoteDeadline?.message}
                  voteMinClose={params.governance_proposal_freeform_minClose}
                  voteMaxClose={params.governance_proposal_freeform_maxClose}
                />

                <ProposalFormSubmit isSubmitting={isSubmitting} />
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
