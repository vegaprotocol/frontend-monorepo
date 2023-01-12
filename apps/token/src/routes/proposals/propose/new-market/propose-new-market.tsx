import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getClosingTimestamp,
  getEnactmentTimestamp,
  useProposalSubmit,
  doesValueEquateToParam,
} from '@vegaprotocol/governance';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  createDocsLinks,
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
  ProposalFormDownloadJson,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { ProposalMinRequirements } from '../../components/shared';
import { AsyncRenderer, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { ProposalUserAction } from '../../components/shared';
import { downloadJson } from '../../../../lib/download-json';

export interface NewMarketProposalFormFields {
  proposalVoteDeadline: string;
  proposalEnactmentDeadline: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

const DOCS_LINK = '/new-market-proposal';

export const ProposeNewMarket = () => {
  const {
    params,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParams([
    NetworkParams.governance_proposal_market_maxClose,
    NetworkParams.governance_proposal_market_minClose,
    NetworkParams.governance_proposal_market_maxEnact,
    NetworkParams.governance_proposal_market_minEnact,
    NetworkParams.governance_proposal_market_minProposerBalance,
    NetworkParams.spam_protection_proposal_min_tokens,
  ]);

  const { VEGA_EXPLORER_URL, VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<NewMarketProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const assembleProposal = (fields: NewMarketProposalFormFields) => {
    const isVoteDeadlineAtMinimum = doesValueEquateToParam(
      fields.proposalVoteDeadline,
      params.governance_proposal_market_minClose
    );
    const isVoteDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalVoteDeadline,
      params.governance_proposal_market_maxClose
    );
    const isEnactmentDeadlineAtMinimum = doesValueEquateToParam(
      fields.proposalEnactmentDeadline,
      params.governance_proposal_market_minEnact
    );
    const isEnactmentDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalEnactmentDeadline,
      params.governance_proposal_market_maxEnact
    );

    return {
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newMarket: fields.proposalTerms
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
      },
    };
  };

  const onSubmit = async (fields: NewMarketProposalFormFields) => {
    await submit(assembleProposal(fields));
  };

  const viewJson = () => {
    const formData = watch();
    downloadJson(
      JSON.stringify(assembleProposal(formData)),
      'vega-new-market-proposal'
    );
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={params}
      render={(params) => (
        <>
          <Heading title={t('NewMarketProposal')} />

          <ProposalMinRequirements
            minProposalBalance={
              params.governance_proposal_market_minProposerBalance
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
              {t('MoreMarketsInfo')}{' '}
              <ExternalLink
                href={`${VEGA_EXPLORER_URL}/markets`}
                target="_blank"
              >{`${VEGA_EXPLORER_URL}/markets`}</ExternalLink>
            </p>
          )}

          <div data-testid="new-market-proposal-form">
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

              <ProposalFormSubheader>{t('NewMarket')}</ProposalFormSubheader>

              <ProposalFormTerms
                registerField={register('proposalTerms', {
                  required: t('Required'),
                  validate: (value) => validateJson(value),
                })}
                labelOverride={'Terms.newMarket (JSON format)'}
                errorMessage={errors?.proposalTerms?.message}
                docsLink={DOCS_LINK}
              />

              <ProposalFormVoteAndEnactmentDeadline
                onVoteMinMax={setValue}
                voteRegister={register('proposalVoteDeadline', {
                  required: t('Required'),
                })}
                voteErrorMessage={errors?.proposalVoteDeadline?.message}
                voteMinClose={params.governance_proposal_market_minClose}
                voteMaxClose={params.governance_proposal_market_maxClose}
                onEnactMinMax={setValue}
                enactmentRegister={register('proposalEnactmentDeadline', {
                  required: t('Required'),
                })}
                enactmentErrorMessage={
                  errors?.proposalEnactmentDeadline?.message
                }
                enactmentMinClose={params.governance_proposal_market_minEnact}
                enactmentMaxClose={params.governance_proposal_market_maxEnact}
              />

              <ProposalFormSubmit isSubmitting={isSubmitting} />
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
