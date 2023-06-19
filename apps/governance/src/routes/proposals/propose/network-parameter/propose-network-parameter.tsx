import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { suitableForSyntaxHighlighter } from '@vegaprotocol/utils';
import { useNetworkParams } from '@vegaprotocol/network-parameters';
import {
  getClosingTimestamp,
  getEnactmentTimestamp,
  useProposalSubmit,
  doesValueEquateToParam,
} from '@vegaprotocol/proposals';
import { useEnvironment, DocsLinks } from '@vegaprotocol/environment';
import {
  ProposalFormDescription,
  ProposalFormSubheader,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  ProposalFormVoteAndEnactmentDeadline,
  ProposalFormDownloadJson,
} from '../../components/propose';
import { ProposalMinRequirements } from '../../components/shared';
import {
  AsyncRenderer,
  ExternalLink,
  FormGroup,
  Input,
  InputError,
  Select,
  SyntaxHighlighter,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import type { ProposalSubmission } from '@vegaprotocol/wallet';
import { Heading } from '../../../../components/heading';
import { ProposalUserAction } from '../../components/shared';
import { downloadJson } from '../../../../lib/download-json';

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
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<NetworkParameterProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const selectedParamEntry = params
    ? Object.entries(params).find(([key]) => key === selectedNetworkParam)
    : null;

  const assembleProposal = (fields: NetworkParameterProposalFormFields) => {
    const actualNetworkParamKey = fields.proposalNetworkParameterKey
      .split('_')
      .join('.');

    const isVoteDeadlineAtMinimum = doesValueEquateToParam(
      fields.proposalVoteDeadline,
      params.governance_proposal_updateNetParam_minClose
    );
    const isVoteDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalVoteDeadline,
      params.governance_proposal_updateNetParam_maxClose
    );
    const isEnactmentDeadlineAtMinimum = doesValueEquateToParam(
      fields.proposalEnactmentDeadline,
      params.governance_proposal_updateNetParam_minEnact
    );
    const isEnactmentDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalEnactmentDeadline,
      params.governance_proposal_updateNetParam_maxEnact
    );

    return {
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        change: {
          updateNetworkParameter: {
            changes: {
              key: actualNetworkParamKey,
              value: fields.proposalNetworkParameterValue,
            },
          },
        },
        closingTimestamp: BigInt(
          getClosingTimestamp(
            fields.proposalVoteDeadline,
            isVoteDeadlineAtMinimum,
            isVoteDeadlineAtMaximum
          )
        ),
        enactmentTimestamp: BigInt(
          getEnactmentTimestamp(
            fields.proposalEnactmentDeadline,
            isEnactmentDeadlineAtMinimum,
            isEnactmentDeadlineAtMaximum
          )
        ),
      },
    } as ProposalSubmission;
  };

  const onSubmit = async (fields: NetworkParameterProposalFormFields) => {
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
      'vega-network-param-proposal'
    );
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={params}
      render={(params) => (
        <>
          <Heading title={t('NetworkParameterProposal')} />
          <ProposalMinRequirements
            minProposalBalance={
              params.governance_proposal_updateNetParam_minProposerBalance
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
              {t('MoreNetParamsInfo')}{' '}
              <ExternalLink
                href={`${VEGA_EXPLORER_URL}/network-parameters`}
                target="_blank"
              >{`${VEGA_EXPLORER_URL}/network-parameters`}</ExternalLink>
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
                onVoteMinMax={setValue}
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
                onEnactMinMax={setValue}
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
