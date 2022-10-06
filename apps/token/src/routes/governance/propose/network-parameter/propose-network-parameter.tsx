import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  suitableForSyntaxHighlighter,
  useNetworkParams,
} from '@vegaprotocol/react-helpers';
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

      {suitableForSyntaxHighlighter(value) ? (
        <SyntaxHighlighter data={JSON.parse(value)} />
      ) : (
        <Input
          value={value}
          data-testid="selected-proposal-param-current-value"
          readOnly
        />
      )}
    </div>
  );
};

export interface NetworkParameterProposalFormFields {
  proposalVoteDeadline: string;
  proposalEnactmentDeadline: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalNetworkParameterKey: string;
  proposalNetworkParameterValue: string;
  proposalReference: string;
}

const DOCS_LINK = '/network-parameter-proposal';

export const ProposeNetworkParameter = () => {
  const [selectedNetworkParam, setSelectedNetworkParam] = useState<
    string | undefined
  >(undefined);

  const {
    params,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParams();

  const { VEGA_EXPLORER_URL, VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<NetworkParameterProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const selectedParamEntry = params
    ? Object.entries(params).find(([key]) => key === selectedNetworkParam)
    : null;

  const onSubmit = async (fields: NetworkParameterProposalFormFields) => {
    const acutalNetworkParamKey = fields.proposalNetworkParameterKey
      .split('_')
      .join('.');
    await submit({
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        updateNetworkParameter: {
          changes: {
            key: acutalNetworkParamKey,
            value: fields.proposalNetworkParameterValue,
          },
        },
        closingTimestamp: getClosingTimestamp(fields.proposalVoteDeadline),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalVoteDeadline,
          fields.proposalEnactmentDeadline
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
      <Heading title={t('NetworkParameterProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <ProposalFormMinRequirements
              minProposerBalance={
                params.governance_proposal_updateNetParam_minProposerBalance
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
                    data-testid="proposal-parameter-select"
                    id="proposal-parameter-key"
                    {...register('proposalNetworkParameterKey', {
                      required: t('Required'),
                    })}
                    onChange={(e) => setSelectedNetworkParam(e.target.value)}
                    value={selectedNetworkParam}
                  >
                    <option value="">{t('SelectParameter')}</option>
                    {Object.keys(params).map((key) => {
                      const actualKey = key.split('_').join('.');
                      return (
                        <option key={key} value={key}>
                          {actualKey}
                        </option>
                      );
                    })}
                  </Select>
                  {errors?.proposalNetworkParameterKey?.message && (
                    <InputError intent="danger">
                      {errors?.proposalNetworkParameterKey?.message}
                    </InputError>
                  )}
                </FormGroup>

                {selectedNetworkParam && (
                  <div className="mt-[-10px]">
                    {selectedParamEntry && (
                      <SelectedNetworkParamCurrentValue
                        value={selectedParamEntry[1]}
                      />
                    )}

                    <FormGroup
                      label={t('NewProposedValue')}
                      labelFor="proposal-parameter-new-value"
                    >
                      <TextArea
                        data-testid="selected-proposal-param-new-value"
                        id="proposal-parameter-new-value"
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
                  voteMinClose={
                    params.governance_proposal_updateNetParam_minClose
                  }
                  voteMaxClose={
                    params.governance_proposal_updateNetParam_maxClose
                  }
                  enactmentRegister={register('proposalEnactmentDeadline', {
                    required: t('Required'),
                  })}
                  enactmentErrorMessage={
                    errors?.proposalEnactmentDeadline?.message
                  }
                  enactmentMinClose={
                    params.governance_proposal_updateNetParam_minEnact
                  }
                  enactmentMaxClose={
                    params.governance_proposal_updateNetParam_maxEnact
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
