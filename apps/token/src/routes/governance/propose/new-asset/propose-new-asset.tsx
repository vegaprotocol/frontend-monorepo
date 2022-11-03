import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getClosingTimestamp,
  getEnactmentTimestamp,
  getValidationTimestamp,
  useProposalSubmit,
  deadlineToRoundedHours,
} from '@vegaprotocol/governance';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  NetworkParams,
  useNetworkParams,
  validateJson,
} from '@vegaprotocol/react-helpers';
import {
  ProposalFormDescription,
  ProposalFormSubheader,
  ProposalFormSubmit,
  ProposalFormTerms,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { ProposalMinRequirements } from '../../components/shared';
import { AsyncRenderer, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { ProposalUserAction } from '../../components/shared';

export interface NewAssetProposalFormFields {
  proposalVoteDeadline: string;
  proposalEnactmentDeadline: string;
  proposalValidationDeadline: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

const DOCS_LINK = '/new-asset-proposal';

export const ProposeNewAsset = () => {
  const {
    params,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParams([
    NetworkParams.governance_proposal_asset_minClose,
    NetworkParams.governance_proposal_asset_maxClose,
    NetworkParams.governance_proposal_asset_minEnact,
    NetworkParams.governance_proposal_asset_maxEnact,
    NetworkParams.governance_proposal_asset_minProposerBalance,
    NetworkParams.spam_protection_proposal_min_tokens,
  ]);

  const { VEGA_EXPLORER_URL, VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
  } = useForm<NewAssetProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const onSubmit = async (fields: NewAssetProposalFormFields) => {
    const isVoteDeadlineAtMinimum =
      fields.proposalVoteDeadline ===
      deadlineToRoundedHours(
        params.governance_proposal_asset_minClose
      ).toString();

    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newAsset: {
          ...JSON.parse(fields.proposalTerms),
        },
        closingTimestamp: getClosingTimestamp(
          fields.proposalVoteDeadline,
          isVoteDeadlineAtMinimum
        ),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalVoteDeadline,
          fields.proposalEnactmentDeadline,
          isVoteDeadlineAtMinimum
        ),
        validationTimestamp: getValidationTimestamp(
          fields.proposalValidationDeadline
        ),
      },
    });
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={params}
    >
      <Heading title={t('NewAssetProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalMinRequirements
              minProposalBalance={
                params.governance_proposal_asset_minProposerBalance
              }
              spamProtectionMin={params.spam_protection_proposal_min_tokens}
              userAction={ProposalUserAction.CREATE}
            />

            {VEGA_DOCS_URL && (
              <p className="text-sm" data-testid="proposal-docs-link">
                <span className="mr-1">{t('ProposalTermsText')}</span>
                <ExternalLink
                  href={`${VEGA_DOCS_URL}/tutorials/proposals${DOCS_LINK}`}
                  target="_blank"
                >{`${VEGA_DOCS_URL}/tutorials/proposals${DOCS_LINK}`}</ExternalLink>
              </p>
            )}

            {VEGA_EXPLORER_URL && (
              <p className="text-sm">
                {t('MoreAssetsInfo')}{' '}
                <ExternalLink
                  href={`${VEGA_EXPLORER_URL}/assets`}
                  target="_blank"
                >{`${VEGA_EXPLORER_URL}/assets`}</ExternalLink>
              </p>
            )}

            <div data-testid="new-asset-proposal-form">
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

                <ProposalFormSubheader>{t('NewAsset')}</ProposalFormSubheader>

                <ProposalFormTerms
                  registerField={register('proposalTerms', {
                    required: t('Required'),
                    validate: (value) => validateJson(value),
                  })}
                  labelOverride={'Terms.newAsset (JSON format)'}
                  errorMessage={errors?.proposalTerms?.message}
                  customDocLink={DOCS_LINK}
                />

                <ProposalFormVoteAndEnactmentDeadline
                  onVoteMinMax={setValue}
                  voteRegister={register('proposalVoteDeadline', {
                    required: t('Required'),
                  })}
                  voteErrorMessage={errors?.proposalVoteDeadline?.message}
                  voteMinClose={params.governance_proposal_asset_minClose}
                  voteMaxClose={params.governance_proposal_asset_maxClose}
                  onEnactMinMax={setValue}
                  enactmentRegister={register('proposalEnactmentDeadline', {
                    required: t('Required'),
                  })}
                  enactmentErrorMessage={
                    errors?.proposalEnactmentDeadline?.message
                  }
                  enactmentMinClose={params.governance_proposal_asset_minEnact}
                  enactmentMaxClose={params.governance_proposal_asset_maxEnact}
                  validationRequired={true}
                  onValidationMinMax={setValue}
                  validationRegister={register('proposalValidationDeadline', {
                    required: t('Required'),
                  })}
                  validationErrorMessage={
                    errors?.proposalValidationDeadline?.message
                  }
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
