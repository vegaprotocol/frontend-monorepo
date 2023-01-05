import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  getClosingTimestamp,
  getEnactmentTimestamp,
  useProposalSubmit,
  doesValueEquateToParam,
} from '@vegaprotocol/governance';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  createDocsLinks,
  NetworkParams,
  useNetworkParams,
  validateJson,
} from '@vegaprotocol/react-helpers';
import {
  ProposalFormDescription,
  ProposalFormSubheader,
  ProposalFormSubmit,
  ProposalFormTerms,
  ProposalFormTitle,
  ProposalFormTransactionDialog,
  ProposalFormDownloadJson,
  ProposalFormVoteAndEnactmentDeadline,
} from '../../components/propose';
import { ProposalMinRequirements } from '../../components/shared';
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
import { ProposalUserAction } from '../../components/shared';
import { useProposalMarketsQueryQuery } from './__generated___/UpdateMarket';
import { downloadJson } from '../../../../lib/download-json';

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

  const { VEGA_EXPLORER_URL, VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
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
          changes: {
            ...JSON.parse(fields.proposalTerms),
          },
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

  const viewJson = () => {
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

          {VEGA_DOCS_URL && (
            <p className="text-sm" data-testid="proposal-docs-link">
              <span className="mr-1">{t('ProposalTermsText')}</span>
              <ExternalLink
                href={`${
                  createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE
                }${DOCS_LINK}`}
                target="_blank"
              >{`${
                createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE
              }${DOCS_LINK}`}</ExternalLink>
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
                <div className="mt-[-20px] mb-6">
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
