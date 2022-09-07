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
  ProposalFormVoteDeadline,
} from '../../components/propose';
import { AsyncRenderer, Link } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { useNetworkParamWithKeys } from '../../../../hooks/use-network-param';
import { NetworkParams } from '../../../../config';
import type { ProposalFreeformTerms } from '@vegaprotocol/wallet';

export interface FreeformProposalFormFields {
  proposalVoteDeadline: number;
  proposalTitle: string;
  proposalDescription: string;
  proposalTerms: string;
  proposalReference: string;
}

export const ProposeFreeform = () => {
  const {
    data: networkParamsData,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParamWithKeys([
    NetworkParams.GOV_FREEFORM_MIN_CLOSE,
    NetworkParams.GOV_FREEFORM_MAX_CLOSE,
    NetworkParams.GOV_FREEFORM_MIN_PROPOSER_BALANCE,
    NetworkParams.SPAM_PROTECTION_PROPOSAL_MIN_TOKENS,
  ]);

  const minVoteDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_FREEFORM_MIN_CLOSE
  )?.value;
  const maxVoteDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_FREEFORM_MAX_CLOSE
  )?.value;
  const minProposerBalance = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_FREEFORM_MIN_PROPOSER_BALANCE
  )?.value;
  const minSpamBalance = networkParamsData?.find(
    ({ key }) => key === NetworkParams.SPAM_PROTECTION_PROPOSAL_MIN_TOKENS
  )?.value;

  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FreeformProposalFormFields>();
  const { finalizedProposal, submit, TransactionDialog } = useProposalSubmit();

  const onSubmit = async (fields: FreeformProposalFormFields) => {
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        newFreeform: {},
        closingTimestamp: getClosingTimestamp(fields.proposalVoteDeadline),
      } as ProposalFreeformTerms,
    });
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={networkParamsData}
    >
      <Heading title={t('NewFreeformProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements
              minProposerBalance={minProposerBalance}
              spamProtectionMin={minSpamBalance}
            />

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

                <ProposalFormSubheader>
                  {t('ProposalVoteTitle')}
                </ProposalFormSubheader>

                <ProposalFormVoteDeadline
                  register={register('proposalVoteDeadline', {
                    required: t('Required'),
                  })}
                  errorMessage={errors?.proposalVoteDeadline?.message}
                  minClose={minVoteDeadline as string}
                  maxClose={maxVoteDeadline as string}
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
