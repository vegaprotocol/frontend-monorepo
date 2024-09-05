import { type ReactNode } from 'react';
import compact from 'lodash/compact';
import { Trans, useTranslation } from 'react-i18next';
import {
  CopyWithTooltip,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { shorten } from '@vegaprotocol/utils';
import { Heading, SubHeading } from '../../../../components/heading';
import { truncateMiddle } from '../../../../lib/truncate-middle';
import { CurrentProposalState } from '../current-proposal-state';
import { ProposalInfoLabel } from '../proposal-info-label';
import {
  useCancelTransferProposalDetails,
  useInstrumentDetailsQuery,
  useNewTransferProposalDetails,
} from '@vegaprotocol/proposals';
import { CONSOLE_MARKET_PAGE, DApp, useLinks } from '@vegaprotocol/environment';
import Routes from '../../../routes';
import { Link } from 'react-router-dom';
import { type VoteState } from '../vote-details/use-user-vote';
import { VoteBreakdown } from '../vote-breakdown';
import {
  GovernanceTransferKindMapping,
  type ProposalRejectionReason,
  ProposalRejectionReasonMapping,
  ProposalState,
} from '@vegaprotocol/types';
import { type Proposal, type BatchProposal } from '../../types';
import { type ProposalTermsFieldsFragment } from '../../__generated__/Proposals';
import { differenceInHours, format, formatDistanceToNowStrict } from 'date-fns';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import { MarketName } from '../proposal/market-name';
import { Indicator } from '../proposal/indicator';
import { type ProposalNode } from '../proposal/proposal-utils';
import { AdditionalProposalState } from '../current-proposal-state/current-proposal-state';

const ProposalTypeTags = ({
  proposal,
}: {
  proposal: Proposal | BatchProposal;
}) => {
  const { t } = useTranslation();

  if (proposal.__typename === 'Proposal') {
    return (
      <div data-testid="proposal-type">
        <ProposalTypeTag terms={proposal.terms} />
      </div>
    );
  }

  if (proposal.__typename === 'BatchProposal') {
    return (
      <div data-testid="proposal-type">
        <ProposalInfoLabel variant="secondary">
          <span>{t('Batch Proposal')}</span>
          <span className="bg-surface-3 rounded-full px-1 text-center">
            {proposal.subProposals?.length || 0}
          </span>
        </ProposalInfoLabel>
      </div>
    );
  }

  return null;
};

const ProposalTypeTag = ({
  terms,
}: {
  terms: Pick<ProposalTermsFieldsFragment, 'change'>;
}) => {
  const { t } = useTranslation();

  switch (terms.change.__typename) {
    // Special case for markets where we want to show the product type in the tag
    case 'NewMarket': {
      return (
        <ProposalInfoLabel variant="secondary">
          {t(
            terms.change?.instrument?.product?.__typename
              ? `NewMarket${terms.change.instrument.product.__typename}`
              : 'NewMarket'
          )}
        </ProposalInfoLabel>
      );
    }
    default: {
      return (
        <ProposalInfoLabel variant="secondary">
          {t(terms.change.__typename)}
        </ProposalInfoLabel>
      );
    }
  }
};

const ProposalDetails = ({
  proposal,
}: {
  proposal: Proposal | BatchProposal;
  restData?: ProposalNode | null;
}) => {
  const { t } = useTranslation();
  const consoleLink = useLinks(DApp.Console);

  const renderDetails = (
    terms: ProposalTermsFieldsFragment,
    proposalId?: string | null
  ) => {
    switch (terms.change?.__typename) {
      case 'NewSpotMarket': {
        return (
          <span>
            {t('New spot market:')} <span>{terms.change.instrument.code}</span>
          </span>
        );
      }
      case 'NewMarket': {
        const getAsset = (terms: ProposalTermsFieldsFragment) => {
          if (
            terms?.change.__typename === 'NewMarket' &&
            (terms.change.instrument.product?.__typename === 'FutureProduct' ||
              terms.change.instrument.product?.__typename ===
                'PerpetualProduct')
          ) {
            return terms.change.instrument.product.settlementAsset;
          }
          return undefined;
        };

        return (
          <>
            {terms.change.successorConfiguration && (
              <ParentMarketCode
                parentMarketId={
                  terms.change.successorConfiguration.parentMarketId
                }
              />
            )}
            <span>
              {t('New market')}: {terms.change.instrument.code}.
            </span>{' '}
            {terms && getAsset(terms)?.symbol ? (
              <>
                <span className="font-semibold">{getAsset(terms)?.symbol}</span>{' '}
                {t('settled future')}.
              </>
            ) : (
              ''
            )}
          </>
        );
      }
      case 'UpdateMarketState': {
        const marketPageLink = consoleLink(
          CONSOLE_MARKET_PAGE.replace(':marketId', terms.change.market.id)
        );
        return (
          <span>
            {terms.change?.market?.id && terms.change.updateType ? (
              <>
                <span>{t(terms.change.updateType)}: </span>
                <span className="inline-flex gap-2">
                  <span className="break-all">
                    <MarketName marketId={terms.change.market.id} />
                  </span>
                  <span className="inline-flex items-end gap-0">
                    <CopyWithTooltip
                      text={terms.change.market.id}
                      description={t('copyId')}
                    >
                      <button className="inline-block px-1">
                        <VegaIcon size={20} name={VegaIconNames.COPY} />
                      </button>
                    </CopyWithTooltip>
                    <Tooltip description={t('OpenInConsole')} align="center">
                      <Link
                        className="inline-block px-1"
                        to={marketPageLink}
                        target="_blank"
                      >
                        <VegaIcon
                          size={20}
                          name={VegaIconNames.OPEN_EXTERNAL}
                        />
                      </Link>
                    </Tooltip>
                  </span>
                </span>
              </>
            ) : null}
          </span>
        );
      }
      case 'UpdateSpotMarket':
      case 'UpdateMarket': {
        const marketPageLink = consoleLink(
          CONSOLE_MARKET_PAGE.replace(':marketId', terms.change.marketId)
        );

        return (
          <>
            <span>{t('UpdateToMarket')}: </span>
            <span className="inline-flex items-start gap-2">
              <span className="break-all">
                <MarketName marketId={terms.change.marketId} />
              </span>
              <span className="inline-flex items-end gap-0">
                <CopyWithTooltip
                  text={terms.change.marketId}
                  description={t('copyId')}
                >
                  <button className="inline-block px-1">
                    <VegaIcon size={20} name={VegaIconNames.COPY} />
                  </button>
                </CopyWithTooltip>
                <Tooltip description={t('OpenInConsole')} align="center">
                  <Link
                    className="inline-block px-1"
                    target="_blank"
                    to={marketPageLink}
                  >
                    <VegaIcon size={20} name={VegaIconNames.OPEN_EXTERNAL} />
                  </Link>
                </Tooltip>
              </span>
            </span>
          </>
        );
      }
      case 'UpdateReferralProgram': {
        return null;
      }
      case 'UpdateVolumeDiscountProgram': {
        return null;
      }
      case 'NewAsset': {
        return (
          <>
            <span>{t('Symbol')}:</span> <Badge>{terms.change.symbol}</Badge>.{' '}
            {terms.change.source.__typename === 'ERC20' && (
              <>
                <span>{t('ERC20ContractAddress')}:</span>{' '}
                <Badge>{terms.change.source.contractAddress}</Badge>
              </>
            )}{' '}
            {terms.change.source.__typename === 'BuiltinAsset' && (
              <>
                <span>{t('MaxFaucetAmountMint')}:</span>{' '}
                <Badge>{terms.change.source.maxFaucetAmountMint}</Badge>
              </>
            )}
          </>
        );
      }
      case 'UpdateNetworkParameter': {
        return (
          <Trans
            i18nKey="Change <lozenge>{{key}}</Badge> to <lozenge>{{value}}</lozenge>"
            values={{
              key: terms.change.networkParameter.key,
              value: terms.change.networkParameter.value,
            }}
            components={{
              // @ts-ignore children passed by i18next
              lozenge: <Badge />,
            }}
          />
        );
      }
      case 'NewFreeform': {
        return <span />;
      }
      case 'UpdateAsset': {
        return (
          <Trans
            i18nKey="Asset ID: <lozenge>{{id}}</lozenge>"
            values={{
              id: truncateMiddle(terms.change.assetId),
            }}
            components={{
              // @ts-ignore children passed by i18next
              lozenge: <Badge />,
            }}
          />
        );
      }
      case 'NewTransfer':
        return <NewTransferSummary proposalId={proposalId} />;
      case 'CancelTransfer':
        return <CancelTransferSummary proposalId={proposalId} />;
      default: {
        return null;
      }
    }
  };

  let details = null;

  if (proposal.__typename === 'Proposal') {
    details = (
      <div>
        <div>{renderDetails(proposal.terms, proposal.id)}</div>
        <VoteStateText
          state={proposal.state}
          closingDatetime={proposal.terms.closingDatetime}
          enactmentDatetime={proposal.terms.enactmentDatetime}
          rejectionReason={proposal.rejectionReason}
        />
      </div>
    );
  }

  if (proposal.__typename === 'BatchProposal' && proposal.subProposals) {
    details = (
      <div>
        <h3 className="text-xl border-b border-gs-300 dark:border-gs-700 pb-3 mb-3">
          Proposals in batch
        </h3>
        <ul className="flex flex-col gap-2 border-b border-gs-300 dark:border-gs-700 pb-3 mb-3">
          {proposal.subProposals.map((p, i) => {
            if (!p?.terms) return null;
            return (
              <li
                key={i}
                className="grid grid-cols-[40px_minmax(0,1fr)] grid-rows-1 gap-3 items-center"
              >
                <Indicator indicator={i + 1} />
                <span>
                  <div>{renderDetails(p.terms, p?.id)}</div>
                  <SubProposalStateText
                    state={proposal.state}
                    enactmentDatetime={p.terms.enactmentDatetime}
                  />
                </span>
              </li>
            );
          })}
        </ul>
        <BatchProposalStateText
          state={proposal.state}
          closingDatetime={proposal.batchTerms?.closingDatetime}
          rejectionReason={proposal.rejectionReason}
        />
      </div>
    );
  }

  return (
    <div data-testid="proposal-details" className="break-words mb-6">
      {details}
    </div>
  );
};

const VoteStateText = ({
  state,
  closingDatetime,
  enactmentDatetime,
  rejectionReason,
}: {
  state: ProposalState;
  closingDatetime: string;
  enactmentDatetime: string;
  rejectionReason: ProposalRejectionReason | null | undefined;
}) => {
  const { t } = useTranslation();
  const nowToCloseInHours = differenceInHours(
    new Date(closingDatetime),
    new Date()
  );

  const props = {
    'data-testid': 'vote-details',
  };

  switch (state) {
    case ProposalState.STATE_ENACTED: {
      return (
        <p {...props}>
          {t('enactedOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_PASSED:
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      return (
        <p {...props}>
          {t('enactsOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_OPEN: {
      return (
        <p {...props}>
          <span className={nowToCloseInHours < 6 ? 'text-orange' : ''}>
            {t('{{time}} left to vote', {
              time: formatDistanceToNowStrict(new Date(closingDatetime)),
            })}
          </span>
        </p>
      );
    }
    case ProposalState.STATE_DECLINED: {
      return <p {...props}>{t(state)}</p>;
    }
    case ProposalState.STATE_REJECTED: {
      const props = { 'data-testid': 'vote-status' };

      if (rejectionReason) {
        return (
          <p {...props}>{t(ProposalRejectionReasonMapping[rejectionReason])}</p>
        );
      }

      return <p {...props}>{t('Proposal rejected')}</p>;
    }
    default: {
      return null;
    }
  }
};

/**
 * Renders state details relevant to the sub proposal, namely the enactment
 * date and time
 */
const SubProposalStateText = ({
  state,
  enactmentDatetime,
}: {
  state: ProposalState;
  enactmentDatetime: string;
}) => {
  const { t } = useTranslation();

  const props = {
    'data-testid': 'vote-details',
    className: 'm-0',
  };

  switch (state) {
    case ProposalState.STATE_ENACTED: {
      return (
        <p {...props}>
          {t('enactedOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_OPEN:
    case ProposalState.STATE_PASSED:
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      return (
        <p {...props}>
          {t('enactsOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_REJECTED:
    case ProposalState.STATE_DECLINED: {
      // If voting is still open we render a single clost time for all sub proposals
      return null;
    }
    default: {
      return null;
    }
  }
};

/**
 * Renders state details relevant for the entire batch. IE. if the proposal was
 * rejected or declined, or the vote close time. Does not render enactment times as
 * those are relevant to the sub proposal
 */
const BatchProposalStateText = ({
  state,
  closingDatetime,
  rejectionReason,
}: {
  state: ProposalState;
  closingDatetime: string;
  rejectionReason: ProposalRejectionReason | null | undefined;
}) => {
  const { t } = useTranslation();
  const nowToCloseInHours = differenceInHours(
    new Date(closingDatetime),
    new Date()
  );

  const props = {
    'data-testid': 'vote-details',
  };

  switch (state) {
    case ProposalState.STATE_ENACTED:
    case ProposalState.STATE_PASSED:
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      return null;
    }
    case ProposalState.STATE_OPEN: {
      return (
        <p {...props}>
          <span className={nowToCloseInHours < 6 ? 'text-orange' : ''}>
            {t('{{time}} left to vote', {
              time: formatDistanceToNowStrict(new Date(closingDatetime)),
            })}
          </span>
        </p>
      );
    }
    case ProposalState.STATE_DECLINED: {
      return <p {...props}>{t(state)}</p>;
    }
    case ProposalState.STATE_REJECTED: {
      const props = { 'data-testid': 'vote-status' };

      if (rejectionReason) {
        return (
          <p {...props}>{t(ProposalRejectionReasonMapping[rejectionReason])}</p>
        );
      }

      return <p {...props}>{t('Proposal rejected')}</p>;
    }
    default: {
      return null;
    }
  }
};

export const ProposalHeader = ({
  proposal,
  restData,
  isListItem = true,
  voteState,
}: {
  proposal: Proposal | BatchProposal;
  restData?: ProposalNode | null;
  isListItem?: boolean;
  voteState?: VoteState | null;
}) => {
  const { t } = useTranslation();

  const title = proposal?.rationale.title.trim();

  const fallbackTitle = t(
    proposal.__typename === 'Proposal'
      ? 'Unknown proposal'
      : 'Unknown batch proposal'
  );
  const titleContent = shorten(title ?? '', 100);

  let overallProposalState: ProposalState | AdditionalProposalState =
    proposal.state;

  // Mark proposal as "passed with errors" if batch is passed but any of the
  // sub-proposal errored.
  if (
    proposal.state === ProposalState.STATE_PASSED &&
    proposal.__typename === 'BatchProposal'
  ) {
    const subStates = compact(proposal.subProposals?.map((sub) => sub?.state));
    const subPassed = subStates.filter(
      (s) =>
        s === ProposalState.STATE_PASSED || s === ProposalState.STATE_ENACTED
    );
    if (subPassed.length !== subStates.length) {
      overallProposalState = AdditionalProposalState.PASSED_WITH_ERRORS;
    }
  }
  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6 text-sm">
        <ProposalTypeTags proposal={proposal} />

        <div className="flex items-center gap-6">
          {(voteState === 'Yes' || voteState === 'No') && (
            <div
              className="flex items-center gap-2"
              data-testid={`user-voted-${voteState.toLowerCase()}`}
            >
              <div data-testid="you-voted-icon">
                <VegaIcon name={VegaIconNames.VOTE} size={24} />
              </div>
              <div>
                {t('voted')}{' '}
                <span className="uppercase">{t(`voteState_${voteState}`)}</span>
              </div>
            </div>
          )}

          <div data-testid="proposal-status">
            <CurrentProposalState proposalState={overallProposalState} />
          </div>
        </div>
      </div>

      <div data-testid="proposal-title" className="break-all">
        {isListItem ? (
          <header>
            <SubHeading title={titleContent || fallbackTitle} />
          </header>
        ) : (
          <Heading title={titleContent || fallbackTitle} />
        )}
      </div>
      <ProposalDetails proposal={proposal} restData={restData} />
      <VoteBreakdown proposal={proposal} restData={restData} />
    </>
  );
};

export const ParentMarketCode = ({
  parentMarketId,
}: {
  parentMarketId: string;
}) => {
  const { t } = useTranslation();
  const { data } = useInstrumentDetailsQuery({
    variables: {
      marketId: parentMarketId,
    },
  });

  if (!data?.market?.tradableInstrument.instrument.code) return null;

  return (
    <span className="block" data-testid="proposal-successor-info">
      {t('Successor market to')}:{' '}
      <Link
        to={`${Routes.PROPOSALS}/${parentMarketId}`}
        className="hover:underline"
      >
        {data.market.tradableInstrument.instrument.code}
      </Link>
    </span>
  );
};

export const NewTransferSummary = ({
  proposalId,
}: {
  proposalId?: string | null;
}) => {
  const { t } = useTranslation();
  const details = useNewTransferProposalDetails(proposalId);

  if (!details) return null;

  return (
    <span>
      {GovernanceTransferKindMapping[details.kind.__typename]}{' '}
      {t('transfer from')}{' '}
      <Badge>
        {details.source
          ? truncateMiddle(details.source)
          : t(details.sourceType)}
      </Badge>{' '}
      {t('to')}{' '}
      <Badge>
        {details.destination
          ? truncateMiddle(details.destination)
          : t(details.destinationType)}
      </Badge>
    </span>
  );
};

export const CancelTransferSummary = ({
  proposalId,
}: {
  proposalId?: string | null;
}) => {
  const { t } = useTranslation();
  const details = useCancelTransferProposalDetails(proposalId);

  if (!details) return null;

  return (
    <span>
      {t('Cancel transfer: ')}{' '}
      <Badge>{truncateMiddle(details.transferId)}</Badge>
    </span>
  );
};

const Badge = ({ children }: { children: ReactNode }) => (
  <div className="rounded px-1 py-[2px] text-xs items-center gap-1 inline-flex bg-surface-3 text-gs-50">
    {children}
  </div>
);
