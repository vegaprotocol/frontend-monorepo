import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useProposalSubmit,
  getClosingTimestamp,
  getEnactmentTimestamp,
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
import { useNetworkParamWithKeys } from '../../../../hooks/use-network-param';
import { NetworkParams } from '../../../../config';
import type { ProposalNewMarketTerms } from '@vegaprotocol/wallet';

export interface NewMarketProposalFormFields {
  proposalVoteDeadline: number;
  proposalEnactmentDeadline: number;
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

export const ProposeNewMarket = () => {
  const {
    data: networkParamsData,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParamWithKeys([
    NetworkParams.GOV_NEW_MARKET_MIN_CLOSE,
    NetworkParams.GOV_NEW_MARKET_MAX_CLOSE,
    NetworkParams.GOV_NEW_MARKET_MIN_ENACT,
    NetworkParams.GOV_NEW_MARKET_MAX_ENACT,
    NetworkParams.GOV_NEW_MARKET_MIN_PROPOSER_BALANCE,
    NetworkParams.SPAM_PROTECTION_PROPOSAL_MIN_TOKENS,
  ]);

  const {
    minVoteDeadline,
    maxVoteDeadline,
    minEnactmentDeadline,
    maxEnactmentDeadline,
    minProposerBalance,
    minSpamBalance,
  } = useMemo(
    () => ({
      minVoteDeadline: networkParamsData?.find(
        ({ key }) => key === NetworkParams.GOV_NEW_MARKET_MIN_CLOSE
      )?.value,
      maxVoteDeadline: networkParamsData?.find(
        ({ key }) => key === NetworkParams.GOV_NEW_MARKET_MAX_CLOSE
      )?.value,
      minEnactmentDeadline: networkParamsData?.find(
        ({ key }) => key === NetworkParams.GOV_NEW_MARKET_MIN_ENACT
      )?.value,
      maxEnactmentDeadline: networkParamsData?.find(
        ({ key }) => key === NetworkParams.GOV_NEW_MARKET_MAX_ENACT
      )?.value,
      minProposerBalance: networkParamsData?.find(
        ({ key }) => key === NetworkParams.GOV_NEW_MARKET_MIN_PROPOSER_BALANCE
      )?.value,
      minSpamBalance: networkParamsData?.find(
        ({ key }) => key === NetworkParams.SPAM_PROTECTION_PROPOSAL_MIN_TOKENS
      )?.value,
    }),
    [networkParamsData]
  );

  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<NewMarketProposalFormFields>();
  const { finalizedProposal, submit, TransactionDialog } = useProposalSubmit();

  const onSubmit = async (fields: NewMarketProposalFormFields) => {
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newMarket: {
          ...JSON.parse(fields.proposalTerms),
        },
        closingTimestamp: getClosingTimestamp(fields.proposalVoteDeadline),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalVoteDeadline,
          fields.proposalEnactmentDeadline
        ),
      } as ProposalNewMarketTerms,
    });
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={networkParamsData}
    >
      <Heading title={t('NewMarketProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements
              minProposerBalance={minProposerBalance}
              spamProtectionMin={minSpamBalance}
            />

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
                  errorMessage={errors?.proposalTerms?.message}
                />

                <ProposalFormVoteAndEnactmentDeadline
                  voteRegister={register('proposalVoteDeadline', {
                    required: t('Required'),
                  })}
                  voteErrorMessage={errors?.proposalVoteDeadline?.message}
                  voteMinClose={minVoteDeadline as string}
                  voteMaxClose={maxVoteDeadline as string}
                  enactmentRegister={register('proposalEnactmentDeadline', {
                    required: t('Required'),
                  })}
                  enactmentErrorMessage={
                    errors?.proposalEnactmentDeadline?.message
                  }
                  enactmentMinClose={minEnactmentDeadline as string}
                  enactmentMaxClose={maxEnactmentDeadline as string}
                />

                <ProposalFormSubmit isSubmitting={isSubmitting} />
                <ProposalFormTransactionDialog
                  finalizedProposal={finalizedProposal}
                  TransactionDialog={TransactionDialog}
                />
              </form>
            </div>
          </>
        )}
      </VegaWalletContainer>
    </AsyncRenderer>
  );
};
