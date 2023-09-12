import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useEnvironment,
  DocsLinks,
  ExternalLinks,
} from '@vegaprotocol/environment';
import { Heading, SubHeading } from '../../../../components/heading';
import {
  AsyncRenderer,
  ExternalLink,
  FormGroup,
  InputError,
  RoundedWrapper,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import { validateJson } from '@vegaprotocol/utils';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { useProposalSubmit } from '@vegaprotocol/proposals';
import {
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
} from '../../components/propose';
import { ProposalRawMinRequirements } from './proposal-raw-min-requirements';

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
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RawProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const hasError = Boolean(errors.rawProposalData?.message);

  const onSubmit = async (fields: RawProposalFormFields) => {
    await submit(JSON.parse(fields.rawProposalData));
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

          {VEGA_EXPLORER_URL && (
            <p className="text-sm">
              {t('MoreProposalsInfo')}{' '}
              <ExternalLink
                href={`${VEGA_EXPLORER_URL}/governance`}
                target="_blank"
              >{`${VEGA_EXPLORER_URL}/governance`}</ExternalLink>
            </p>
          )}

          <section data-testid="how-to" className="my-10">
            <RoundedWrapper paddingBottom={true}>
              <SubHeading title={t('HowToPropose')} />
              <ul>
                <li className="p-1">
                  {t('HowToProposeRawStep1')}{' '}
                  {ExternalLinks && (
                    <span data-testid="proposal-docs-link">
                      <ExternalLink
                        href={ExternalLinks.PROPOSALS_FORUM}
                        target="_blank"
                      >
                        {ExternalLinks.PROPOSALS_FORUM}
                      </ExternalLink>
                    </span>
                  )}
                </li>
                <li className="p-1">
                  {t('HowToProposeRawStep2')}{' '}
                  {DocsLinks && (
                    <span data-testid="proposal-docs-link">
                      <ExternalLink
                        href={DocsLinks.PROPOSALS_GUIDE}
                        target="_blank"
                      >
                        {DocsLinks.PROPOSALS_GUIDE}
                      </ExternalLink>
                    </span>
                  )}
                </li>
                <li className="p-1">{t('HowToProposeRawStep3')}</li>
              </ul>
            </RoundedWrapper>
          </section>

          <div data-testid="raw-proposal-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup label="Valid JSON required" labelFor="proposal-data">
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
