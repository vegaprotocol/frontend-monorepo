import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  doesValueEquateToParam,
  getClosingTimestamp,
  getEnactmentTimestamp,
  useProposalSubmit,
} from '@vegaprotocol/proposals';
import { useEnvironment, DocsLinks } from '@vegaprotocol/environment';
import { useValidateJson } from '@vegaprotocol/utils';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import {
  ProposalFormDescription,
  ProposalFormDownloadJson,
  ProposalFormSubheader,
  ProposalFormTerms,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import {
  ProposalMinRequirements,
  ProposalUserAction,
} from '../../components/shared';
import {
  AsyncRenderer,
  ExternalLink,
  FormGroup,
  InputError,
  KeyValueTable,
  KeyValueTableRow,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { useProposalMarketsQueryQuery } from './__generated__/UpdateMarket';
import { downloadJson } from '../../../../lib/download-json';
import { ProposalState } from '@vegaprotocol/types';

export interface UpdateMarketProposalFormFields {
  proposalVoteDeadline: string;
  proposalEnactmentDeadline: string;
  proposalTitle: string;
  proposalDescription: string;
  proposalMarketId: string;
  proposalTerms: string;
  proposalReference: string;
}

const DOCS_LINK = '/update-market-proposal';

export const ProposeUpdateMarket = () => {
  const validateJson = useValidateJson();
  const {
    params,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParams([
    NetworkParams.governance_proposal_updateMarket_maxClose,
    NetworkParams.governance_proposal_updateMarket_minClose,
    NetworkParams.governance_proposal_updateMarket_maxEnact,
    NetworkParams.governance_proposal_updateMarket_minEnact,
    NetworkParams.governance_proposal_updateMarket_minProposerBalance,
    NetworkParams.spam_protection_proposal_min_tokens,
  ]);

  const {
    data: marketsData,
    loading: marketsLoading,
    error: marketsError,
  } = useProposalMarketsQueryQuery();
  const sortedMarkets = useMemo(() => {
    if (!marketsData?.marketsConnection?.edges.length) {
      return [];
    }

    return marketsData.marketsConnection.edges
      .map((edge) => edge.node)
      .filter(
        (market) => market.proposal?.state === ProposalState.STATE_ENACTED
      )
      .sort((a, b) => {
        const aName = a.tradableInstrument.instrument.name;
        const bName = b.tradableInstrument.instrument.name;

        if (aName < bName) {
          return -1;
        }
        if (aName > bName) {
          return 1;
        }
        return 0;
      });
  }, [marketsData]);

  const [selectedMarket, setSelectedMarket] = useState<string | undefined>(
    undefined
  );
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<UpdateMarketProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const assembleProposal = (fields: UpdateMarketProposalFormFields) => {
    const isVoteDeadlineAtMinimum = doesValueEquateToParam(
      fields.proposalVoteDeadline,
      params.governance_proposal_updateMarket_minClose
    );
    const isVoteDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalVoteDeadline,
      params.governance_proposal_updateMarket_maxClose
    );
    const isEnactmentDeadlineAtMinimum = doesValueEquateToParam(
      fields.proposalEnactmentDeadline,
      params.governance_proposal_updateMarket_minEnact
    );
    const isEnactmentDeadlineAtMaximum = doesValueEquateToParam(
      fields.proposalEnactmentDeadline,
      params.governance_proposal_updateMarket_maxEnact
    );

    return {
      rationale: {
        title: fields.proposalTitle,
        description: fields.proposalDescription,
      },
      terms: {
        updateMarket: {
          marketId: fields.proposalMarketId,
          changes: fields.proposalTerms
            ? { ...JSON.parse(fields.proposalTerms) }
            : {},
        },
        closingTimestamp: getClosingTimestamp(
          fields.proposalVoteDeadline,
          isVoteDeadlineAtMinimum,
          isVoteDeadlineAtMaximum
        ),
        enactmentTimestamp: getEnactmentTimestamp(
          fields.proposalEnactmentDeadline,
          isEnactmentDeadlineAtMinimum,
          isEnactmentDeadlineAtMaximum
        ),
      },
    };
  };

  const onSubmit = async (fields: UpdateMarketProposalFormFields) => {
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
      'vega-update-market-proposal'
    );
  };

  return (
    <AsyncRenderer
      loading={networkParamsLoading && marketsLoading}
      error={networkParamsError && marketsError}
      data={{ ...params, ...marketsData }}
      render={(data) => (
        <>
          <Heading title={t('UpdateMarketProposal')} />
          <ProposalMinRequirements
            minProposalBalance={
              data.governance_proposal_updateMarket_minProposerBalance
            }
            spamProtectionMin={data.spam_protection_proposal_min_tokens}
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
              {t('MoreMarketsInfo')}{' '}
              <ExternalLink
                href={`${VEGA_EXPLORER_URL}/markets`}
                target="_blank"
              >{`${VEGA_EXPLORER_URL}/markets`}</ExternalLink>
            </p>
          )}

          <div data-testid="update-market-proposal-form">
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
                {t('SelectAMarketToChange')}
              </ProposalFormSubheader>

              <FormGroup
                label={t('SelectAMarketToChange')}
                labelFor="proposal-market"
                hideLabel={true}
              >
                <Select
                  data-testid="proposal-market-select"
                  id="proposal-market"
                  {...register('proposalMarketId', {
                    required: t('Required'),
                  })}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                >
                  <option value="">{t('SelectMarket')}</option>
                  {sortedMarkets.map((market) => (
                    <option value={market.id} key={market.id}>
                      {market.tradableInstrument.instrument.name}
                    </option>
                  ))}
                </Select>
                {errors?.proposalMarketId?.message && (
                  <InputError intent="danger">
                    {errors?.proposalMarketId?.message}
                  </InputError>
                )}
              </FormGroup>

              {selectedMarket && (
                <div className="mb-6 mt-[-20px]">
                  <KeyValueTable data-testid="update-market-details">
                    <KeyValueTableRow>
                      {t('MarketName')}
                      {
                        data.marketsConnection?.edges?.find(
                          ({ node: market }) => market.id === selectedMarket
                        )?.node.tradableInstrument.instrument.name
                      }
                    </KeyValueTableRow>
                    <KeyValueTableRow>
                      {t('MarketCode')}
                      {
                        data.marketsConnection?.edges?.find(
                          ({ node: market }) => market.id === selectedMarket
                        )?.node.tradableInstrument.instrument.code
                      }
                    </KeyValueTableRow>
                    <KeyValueTableRow>
                      {t('MarketId')}
                      {selectedMarket}
                    </KeyValueTableRow>
                  </KeyValueTable>
                </div>
              )}

              <ProposalFormTerms
                registerField={register('proposalTerms', {
                  required: t('Required'),
                  validate: (value) => validateJson(value),
                })}
                labelOverride={t('ProposeUpdateMarketTerms')}
                errorMessage={errors?.proposalTerms?.message}
                docsLink={DOCS_LINK}
              />

              <ProposalFormVoteAndEnactmentDeadline
                onVoteMinMax={setValue}
                voteRegister={register('proposalVoteDeadline', {
                  required: t('Required'),
                })}
                voteErrorMessage={errors?.proposalVoteDeadline?.message}
                voteMinClose={data.governance_proposal_updateMarket_minClose}
                voteMaxClose={data.governance_proposal_updateMarket_maxClose}
                onEnactMinMax={setValue}
                enactmentRegister={register('proposalEnactmentDeadline', {
                  required: t('Required'),
                })}
                enactmentErrorMessage={
                  errors?.proposalEnactmentDeadline?.message
                }
                enactmentMinClose={
                  data.governance_proposal_updateMarket_minEnact
                }
                enactmentMaxClose={
                  data.governance_proposal_updateMarket_maxEnact
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
