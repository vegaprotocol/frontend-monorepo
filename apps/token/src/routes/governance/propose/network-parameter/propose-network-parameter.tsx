import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  useProposalSubmit,
  getClosingTimestamp,
  getEnactmentTimestamp,
} from '@vegaprotocol/governance';
import {
  ProposalFormSubheader,
  ProposalFormMinRequirements,
  ProposalFormTitle,
  ProposalFormDescription,
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
  ProposalFormVoteDeadline,
  ProposalFormEnactmentDeadline,
} from '../../components/propose';
import {
  AsyncRenderer,
  FormGroup,
  TextArea,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { useNetworkParamWithKeys } from '../../../../hooks/use-network-param';
import { NetworkParams } from '../../../../config';
import type { ProposalNetworkParameterTerms } from '@vegaprotocol/wallet';

export interface NetworkParameterProposalFormFields {
  proposalVoteDeadline: number;
  proposalEnactmentDeadline: number;
  proposalTitle: string;
  proposalDescription: string;
  proposalNetworkParameterKey: string;
  proposalNetworkParameterValue: string;
  proposalReference: string;
}

export const ProposeNetworkParameter = () => {
  const {
    data: networkParamsData,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParamWithKeys([]);

  const minVoteDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MIN_CLOSE
  )?.value;
  const maxVoteDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MAX_CLOSE
  )?.value;
  const minEnactmentDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MIN_ENACT
  )?.value;
  const maxEnactmentDeadline = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MAX_ENACT
  )?.value;
  const minProposerBalance = networkParamsData?.find(
    ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MIN_PROPOSER_BALANCE
  )?.value;
  const minSpamBalance = networkParamsData?.find(
    ({ key }) => key === NetworkParams.SPAM_PROTECTION_PROPOSAL_MIN_TOKENS
  )?.value;

  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<NetworkParameterProposalFormFields>();
  const { finalizedProposal, submit, TransactionDialog } = useProposalSubmit();

  const onSubmit = async (fields: NetworkParameterProposalFormFields) => {
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        updateNetworkParameter: {
          changes: {
            key: fields.proposalNetworkParameterKey,
            value: fields.proposalNetworkParameterValue,
          },
        },
        closingTimestamp: getClosingTimestamp(fields.proposalVoteDeadline),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalVoteDeadline,
          fields.proposalEnactmentDeadline
        ),
      } as ProposalNetworkParameterTerms,
    });
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={networkParamsData}
    >
      <Heading title={t('NetworkParameterProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements
              minProposerBalance={minProposerBalance}
              spamProtectionMin={minSpamBalance}
            />
            <div data-testid="network-parameter-proposal-form">
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
                  {t('SelectAParameterToChange')}
                </ProposalFormSubheader>

                <FormGroup
                  label={t('SelectAParameterToChange')}
                  labelFor="proposal-parameter-key"
                  hideLabel={true}
                >
                  <Select
                    id="proposal-parameter-key"
                    {...register('proposalNetworkParameterKey', {
                      required: t('Required'),
                    })}
                  >
                    {networkParamsData?.map(({ key }) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </Select>
                  {errors?.proposalNetworkParameterKey?.message && (
                    <InputError intent="danger">
                      {errors?.proposalNetworkParameterKey?.message}
                    </InputError>
                  )}
                </FormGroup>

                <div className="mt-[-10px]">
                  <FormGroup
                    label={t('NewProposedValue')}
                    labelFor="proposal-parameter-value"
                  >
                    <TextArea
                      id="proposal-parameter-value"
                      {...register('proposalNetworkParameterValue', {
                        required: t('Required'),
                      })}
                    />
                    {errors?.proposalNetworkParameterValue?.message && (
                      <InputError intent="danger">
                        {errors?.proposalNetworkParameterValue?.message}
                      </InputError>
                    )}
                  </FormGroup>
                </div>

                <ProposalFormSubheader>
                  {t('ProposalVoteAndEnactmentTitle')}
                </ProposalFormSubheader>

                <ProposalFormVoteDeadline
                  register={register('proposalVoteDeadline', {
                    required: t('Required'),
                  })}
                  errorMessage={errors?.proposalVoteDeadline?.message}
                  minClose={minVoteDeadline as string}
                  maxClose={maxVoteDeadline as string}
                />

                <div className="mt-[-10px]">
                  <ProposalFormEnactmentDeadline
                    register={register('proposalEnactmentDeadline', {
                      required: t('Required'),
                    })}
                    errorMessage={errors?.proposalEnactmentDeadline?.message}
                    minEnact={minEnactmentDeadline as string}
                    maxEnact={maxEnactmentDeadline as string}
                  />
                </div>

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
