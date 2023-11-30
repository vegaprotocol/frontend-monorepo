import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getClosingTimestamp,
  getEnactmentTimestamp,
  getValidationTimestamp,
  useProposalSubmit,
  doesValueEquateToParam,
} from '@vegaprotocol/proposals';
import { useEnvironment, DocsLinks } from '@vegaprotocol/environment';
import { useValidateJson } from '@vegaprotocol/utils';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import {
  ProposalFormDescription,
  ProposalFormSubheader,
  ProposalFormTerms,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  ProposalFormDownloadJson,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { ProposalMinRequirements } from '../../components/shared';
import { AsyncRenderer, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { ProposalUserAction } from '../../components/shared';
import { downloadJson } from '../../../../lib/download-json';

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
  const validateJson = useValidateJson();
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
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<NewAssetProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const assembleProposal = (fields: NewAssetProposalFormFields) => {
    const isVoteDeadlineAtMinimum = doesValueEquateToParam(
      fields.proposalVoteDeadline,
      params.governance_proposal_asset_minClose
    );
    const isVoteDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalVoteDeadline,
      params.governance_proposal_asset_maxClose
    );
    const isEnactmentDeadlineAtMinimum = doesValueEquateToParam(
      fields.proposalEnactmentDeadline,
      params.governance_proposal_asset_minEnact
    );
    const isEnactmentDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalEnactmentDeadline,
      params.governance_proposal_asset_maxEnact
    );
    const isValidationDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalValidationDeadline,
      params.governance_proposal_asset_maxClose
    );

    return {
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newAsset: fields.proposalTerms
          ? { ...JSON.parse(fields.proposalTerms) }
          : {},
        closingTimestamp: getClosingTimestamp(
          fields.proposalVoteDeadline,
          isVoteDeadlineAtMinimum,
          isVoteDeadlineAtMaximum
        ),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalEnactmentDeadline,
          isEnactmentDeadlineAtMinimum,
          isEnactmentDeadlineAtMaximum
        ),
        validationTimestamp: getValidationTimestamp(
          fields.proposalValidationDeadline,
          isValidationDeadlineAtMaximum
        ),
      },
    };
  };

  const onSubmit = async (fields: NewAssetProposalFormFields) => {
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
      'vega-new-asset-proposal'
    );
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={params}
      render={(params) => (
        <>
          <Heading title={t('NewAssetProposal')} />

          <ProposalMinRequirements
            minProposalBalance={
              params.governance_proposal_asset_minProposerBalance
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
                docsLink={DOCS_LINK}
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
