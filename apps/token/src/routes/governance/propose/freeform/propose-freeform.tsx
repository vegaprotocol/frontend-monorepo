import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getClosingTimestamp,
  useProposalSubmit,
} from '@vegaprotocol/governance';
import {
  ProposalFormSubheader,
  ProposalFormMinRequirements,
  ProposalFormTitle,
  ProposalFormDescription,
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
  ProposalFormVoteDeadline,
} from '../../components/propose';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
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
            <ProposalFormMinRequirements value={minProposerBalance} />
            <div data-testid="freeform-proposal-form">
              <form onSubmit={handleSubmit(onSubmit)}>
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
