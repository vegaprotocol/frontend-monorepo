import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEnvironment } from '@vegaprotocol/environment';
import { Heading } from '../../../../components/heading';
import {
  AsyncRenderer,
  ExternalLink,
  FormGroup,
  InputError,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import { createDocsLinks, validateJson } from '@vegaprotocol/utils';
import { NetworkParams, useNetworkParams } from '@vegaprotocol/react-helpers';
import { useProposalSubmit } from '@vegaprotocol/governance';
import {
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
  ProposalFormDownloadJson,
} from '../../components/propose';
import { ProposalRawMinRequirements } from './proposal-raw-min-requirements';
import { downloadJson } from '../../../../lib/download-json';

export interface RawProposalFormFields {
  rawProposalData: string;
}

export const ProposeRaw = () => {
  const {
    params,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParams([
    NetworkParams.governance_proposal_asset_minProposerBalance,
    NetworkParams.governance_proposal_updateAsset_minProposerBalance,
    NetworkParams.governance_proposal_market_minProposerBalance,
    NetworkParams.governance_proposal_updateMarket_minProposerBalance,
    NetworkParams.governance_proposal_updateNetParam_minProposerBalance,
    NetworkParams.governance_proposal_freeform_minProposerBalance,
    NetworkParams.spam_protection_proposal_min_tokens,
  ]);
  const { VEGA_EXPLORER_URL, VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<RawProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const hasError = Boolean(errors.rawProposalData?.message);

  const onSubmit = async (fields: RawProposalFormFields) => {
    await submit(JSON.parse(fields.rawProposalData));
  };

  const viewJson = () => {
    const formData = watch();
    downloadJson(JSON.stringify(formData), 'vega-raw-proposal');
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={params}
      render={(params) => (
        <>
          <Heading title={t('NewRawProposal')} />

          <ProposalRawMinRequirements
            assetMin={params.governance_proposal_asset_minProposerBalance}
            updateAssetMin={
              params.governance_proposal_updateAsset_minProposerBalance
            }
            marketMin={params.governance_proposal_market_minProposerBalance}
            updateMarketMin={
              params.governance_proposal_updateMarket_minProposerBalance
            }
            updateNetParamMin={
              params.governance_proposal_updateNetParam_minProposerBalance
            }
            freeformMin={params.governance_proposal_freeform_minProposerBalance}
            spamProtectionMin={params.spam_protection_proposal_min_tokens}
          />

          {VEGA_DOCS_URL && (
            <p className="text-sm" data-testid="proposal-docs-link">
              <span className="mr-1">{t('ProposalTermsText')}</span>
              <ExternalLink
                href={createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE}
                target="_blank"
              >
                {createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE}
              </ExternalLink>
            </p>
          )}

          {VEGA_EXPLORER_URL && (
            <p className="text-sm">
              {t('MoreProposalsInfo')}{' '}
              <ExternalLink
                href={`${VEGA_EXPLORER_URL}/governance`}
                target="_blank"
              >{`${VEGA_EXPLORER_URL}/governance`}</ExternalLink>
            </p>
          )}

          <div data-testid="raw-proposal-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup
                label="Make a proposal by submitting JSON"
                labelFor="proposal-data"
              >
                <TextArea
                  id="proposal-data"
                  className="min-h-[200px]"
                  hasError={hasError}
                  data-testid="proposal-data"
                  {...register('rawProposalData', {
                    required: t('Required'),
                    validate: (value) => validateJson(value),
                  })}
                />
                {errors.rawProposalData?.message && (
                  <InputError intent="danger">
                    {errors.rawProposalData?.message}
                  </InputError>
                )}
              </FormGroup>
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
