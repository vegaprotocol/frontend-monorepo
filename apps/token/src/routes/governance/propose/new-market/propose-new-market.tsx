import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useProposalSubmit,
  getClosingTimestamp,
  getEnactmentTimestamp,
  deadlineToRoundedHours,
} from '@vegaprotocol/governance';
import { useEnvironment } from '@vegaprotocol/environment';
import { validateJson } from '@vegaprotocol/react-helpers';
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
import { NetworkParams, useNetworkParams } from '@vegaprotocol/react-helpers';

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
  } = useForm<NewMarketProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const onSubmit = async (fields: NewMarketProposalFormFields) => {
    const isVoteDeadlineAtMinimum =
      fields.proposalVoteDeadline ===
      deadlineToRoundedHours(
        params.governance_proposal_market_minClose
      ).toString();

    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newMarket: {
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
      },
    });
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={params}
    >
      <Heading title={t('NewMarketProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements
              minProposerBalance={
                params.governance_proposal_market_minProposerBalance
              }
              spamProtectionMin={params.spam_protection_proposal_min_tokens}
            />

            {VEGA_DOCS_URL && (
              <p className="text-sm" data-testid="proposal-docs-link">
                <span className="mr-1">{t('ProposalTermsText')}</span>
                <Link
                  href={`${VEGA_DOCS_URL}/tutorials/proposals${DOCS_LINK}`}
                  target="_blank"
                >{`${VEGA_DOCS_URL}/tutorials/proposals${DOCS_LINK}`}</Link>
              </p>
            )}

            {VEGA_EXPLORER_URL && (
              <p className="text-sm">
                {t('MoreMarketsInfo')}{' '}
                <Link
                  href={`${VEGA_EXPLORER_URL}/markets`}
                  target="_blank"
                >{`${VEGA_EXPLORER_URL}/markets`}</Link>
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
                  customDocLink={DOCS_LINK}
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
