import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { isJsonObject } from '@vegaprotocol/react-helpers';
import {
  useProposalSubmit,
  getClosingTimestamp,
  getEnactmentTimestamp,
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
import {
  AsyncRenderer,
  FormGroup,
  Input,
  InputError,
  Link,
  Select,
  SyntaxHighlighter,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import { useNetworkParamWithKeys } from '../../../../hooks/use-network-param';
import { NetworkParams } from '../../../../config';
import type { ProposalNetworkParameterTerms } from '@vegaprotocol/wallet';

interface SelectedNetworkParamCurrentValueProps {
  value: string;
}

const SelectedNetworkParamCurrentValue = ({
  value,
}: SelectedNetworkParamCurrentValueProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <p className="text-sm text-white">{t('CurrentValue')}</p>
      {isJsonObject(value) ? (
        <SyntaxHighlighter data={JSON.parse(value)} />
      ) : (
        <Input value={value} readOnly />
      )}
    </div>
  );
};

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
  const [selectedNetworkParam, setSelectedNetworkParam] = useState<
    string | undefined
  >(undefined);

  const {
    data: networkParamsData,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParamWithKeys([]);

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
        ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MIN_CLOSE
      )?.value,
      maxVoteDeadline: networkParamsData?.find(
        ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MAX_CLOSE
      )?.value,
      minEnactmentDeadline: networkParamsData?.find(
        ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MIN_ENACT
      )?.value,
      maxEnactmentDeadline: networkParamsData?.find(
        ({ key }) => key === NetworkParams.GOV_UPDATE_NET_PARAM_MAX_ENACT
      )?.value,
      minProposerBalance: networkParamsData?.find(
        ({ key }) =>
          key === NetworkParams.GOV_UPDATE_NET_PARAM_MIN_PROPOSER_BALANCE
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

            {VEGA_EXPLORER_URL && (
              <p className="text-sm">
                {t('MoreNetParamsInfo')}{' '}
                <Link
                  href={`${VEGA_EXPLORER_URL}/network-parameters`}
                  target="_blank"
                >{`${VEGA_EXPLORER_URL}/network-parameters`}</Link>
              </p>
            )}

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
                    onChange={(e) => setSelectedNetworkParam(e.target.value)}
                    value={selectedNetworkParam}
                  >
                    <option value="">{t('SelectParameter')}</option>
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

                {selectedNetworkParam && (
                  <div className="mt-[-10px]">
                    <SelectedNetworkParamCurrentValue
                      value={
                        networkParamsData?.find(
                          ({ key }) => key === selectedNetworkParam
                        )?.value || ''
                      }
                    />

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
                )}

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
