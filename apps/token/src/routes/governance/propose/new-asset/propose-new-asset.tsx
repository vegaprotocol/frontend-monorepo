import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useProposalSubmit,
  getClosingTimestamp,
  getEnactmentTimestamp,
  getValidationTimestamp,
} from '@vegaprotocol/governance';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  ProposalFormMinRequirements,
  ProposalFormTitle,
  ProposalFormDescription,
  ProposalFormTerms,
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
  ProposalFormSubheader,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { AsyncRenderer, Link } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import type { ProposalNewAssetTerms } from '@vegaprotocol/wallet';
import { NetworkParams, useNetworkParams } from '@vegaprotocol/react-helpers';

export interface NewAssetProposalFormFields {
  proposalVoteDeadline: string;
  proposalEnactmentDeadline: string;
  proposalValidationDeadline: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

const docsLink = '/new-asset-proposal';

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
  } = useForm<NewAssetProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const onSubmit = async (fields: NewAssetProposalFormFields) => {
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newAsset: {
          ...JSON.parse(fields.proposalTerms),
        },
        closingTimestamp: getClosingTimestamp(fields.proposalVoteDeadline),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalVoteDeadline,
          fields.proposalEnactmentDeadline
        ),
        validationTimestamp: getValidationTimestamp(
          fields.proposalValidationDeadline
        ),
      } as ProposalNewAssetTerms,
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
            <ProposalFormMinRequirements
              minProposerBalance={
                params.governance_proposal_asset_minProposerBalance
              }
              spamProtectionMin={params.spam_protection_proposal_min_tokens}
            />

            {VEGA_DOCS_URL && (
              <p className="text-sm">
                <span className="mr-1">{t('ProposalTermsText')}</span>
                <Link
                  href={`${VEGA_DOCS_URL}/tutorials/proposals${docsLink}`}
                  target="_blank"
                >{`${VEGA_DOCS_URL}/tutorials/proposals${docsLink}`}</Link>
              </p>
            )}

            {VEGA_EXPLORER_URL && (
              <p className="text-sm">
                {t('MoreAssetsInfo')}{' '}
                <Link
                  href={`${VEGA_EXPLORER_URL}/assets`}
                  target="_blank"
                >{`${VEGA_EXPLORER_URL}/assets`}</Link>
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
                    validate: {
                      validateJson: (value) => {
                        try {
                          JSON.parse(value);
                          return true;
                        } catch (e) {
                          return t('Must be valid JSON');
                        }
                      },
                    },
                  })}
                  labelOverride={'Terms.newAsset (JSON format)'}
                  errorMessage={errors?.proposalTerms?.message}
                  customDocLink={docsLink}
                />

                <ProposalFormVoteAndEnactmentDeadline
                  voteRegister={register('proposalVoteDeadline', {
                    required: t('Required'),
                  })}
                  voteErrorMessage={errors?.proposalVoteDeadline?.message}
                  voteMinClose={params.governance_proposal_asset_minClose}
                  voteMaxClose={params.governance_proposal_asset_maxClose}
                  enactmentRegister={register('proposalEnactmentDeadline', {
                    required: t('Required'),
                  })}
                  enactmentErrorMessage={
                    errors?.proposalEnactmentDeadline?.message
                  }
                  enactmentMinClose={params.governance_proposal_asset_minEnact}
                  enactmentMaxClose={params.governance_proposal_asset_maxEnact}
                  validationRequired={true}
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
