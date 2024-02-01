import { useTranslation } from 'react-i18next';
import {
  CopyWithTooltip,
  Lozenge,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { shorten } from '@vegaprotocol/utils';
import { Heading, SubHeading } from '../../../../components/heading';
import { type ReactNode } from 'react';
import { truncateMiddle } from '../../../../lib/truncate-middle';
import { CurrentProposalState } from '../current-proposal-state';
import { ProposalInfoLabel } from '../proposal-info-label';
import {
  useCancelTransferProposalDetails,
  useNewTransferProposalDetails,
  useSuccessorMarketProposalDetails,
} from '@vegaprotocol/proposals';
import {
  CONSOLE_MARKET_PAGE,
  DApp,
  useFeatureFlags,
  useLinks,
} from '@vegaprotocol/environment';
import Routes from '../../../routes';
import { Link } from 'react-router-dom';
import { type VoteState } from '../vote-details/use-user-vote';
import { VoteBreakdown } from '../vote-breakdown';
import { GovernanceTransferKindMapping } from '@vegaprotocol/types';
import { type Proposal, type BatchProposal } from '../../types';
import { type ProposalTermsFieldsFragment } from '../../__generated__/Proposals';

export const ProposalHeader = ({
  proposal,
  isListItem = true,
  voteState,
}: {
  proposal: Proposal | BatchProposal;
  isListItem?: boolean;
  voteState?: VoteState | null;
}) => {
  if (proposal.__typename === 'Proposal') {
    return (
      <SingleProposalHeader
        proposal={proposal}
        isListItem={isListItem}
        voteState={voteState}
      />
    );
  }

  if (proposal.__typename === 'BatchProposal') {
    return <BatchProposalHeader proposal={proposal} voteState={voteState} />;
  }

  return null;
};

const BatchProposalHeader = ({
  proposal,
  voteState,
}: {
  proposal: Proposal | BatchProposal;
  voteState?: VoteState | null;
}) => {
  const { t } = useTranslation();

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
            <CurrentProposalState proposal={proposal} />
          </div>
        </div>
      </div>

      <div data-testid="proposal-title" className="break-all">
        <header>
          <SubHeading
            title={proposal.rationale.title || t('Unknown proposal')}
          />
        </header>
      </div>

      {/* TODO: add proposal details */}
      {/* <ProposalDetails proposal={proposal} /> */}

      {/* TODO: fix type cast */}
      <VoteBreakdown proposal={proposal as Proposal} />
    </>
  );
};

const ProposalTypeTags = ({
  proposal,
}: {
  proposal: Proposal | BatchProposal;
}) => {
  if (proposal.__typename === 'Proposal') {
    return (
      <div data-testid="proposal-type">
        <ProposalTypeTag terms={proposal.terms} />
      </div>
    );
  }

  if (proposal.__typename === 'BatchProposal') {
    return (
      <div data-testid="proposal-type" className="flex gap-1">
        {proposal.subProposals?.map((subProposal) => {
          if (!subProposal?.terms) return null;
          return <ProposalTypeTag terms={subProposal.terms} />;
        })}
      </div>
    );
  }

  return null;
};

const ProposalTypeTag = ({ terms }: { terms: ProposalTermsFieldsFragment }) => {
  const { t } = useTranslation();

  switch (terms.change.__typename) {
    // Speical case for markets where we want to show the product type in the tag
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

const ProposalDetails = ({ proposal }: { proposal: Proposal }) => {
  return (
    <div
      data-testid="proposal-details"
      className="break-words mb-6 text-vega-light-200"
    >
      TODO: The details
    </div>
  );
};

const SingleProposalHeader = ({
  proposal,
  isListItem,
  voteState,
}: {
  proposal: Proposal;
  isListItem?: boolean;
  voteState?: VoteState | null;
}) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const { t } = useTranslation();
  const change = proposal?.terms.change;

  const consoleLink = useLinks(DApp.Console);

  let details: ReactNode;
  let fallbackTitle = '';

  const title = proposal?.rationale.title.trim();

  const titleContent = shorten(title ?? '', 100);

  const getAsset = (proposal: Proposal) => {
    const terms = proposal?.terms;
    if (
      terms?.change.__typename === 'NewMarket' &&
      (terms.change.instrument.product?.__typename === 'FutureProduct' ||
        terms.change.instrument.product?.__typename === 'PerpetualProduct')
    ) {
      return terms.change.instrument.product.settlementAsset;
    }
    return undefined;
  };

  switch (change?.__typename) {
    case 'NewMarket': {
      details = (
        <>
          <SuccessorCode proposalId={proposal?.id} />
          <span>
            {t('Code')}: {change.instrument.code}.
          </span>{' '}
          {proposal?.terms && getAsset(proposal)?.symbol ? (
            <>
              <span className="font-semibold">
                {getAsset(proposal)?.symbol}
              </span>{' '}
              {t('settled future')}.
            </>
          ) : (
            ''
          )}
        </>
      );
      break;
    }
    case 'UpdateMarketState': {
      fallbackTitle = t('UpdateMarketStateProposal');
      details = (
        <span>
          {featureFlags.UPDATE_MARKET_STATE &&
          // @ts-ignore types are fucked
          change?.market?.id &&
          // @ts-ignore types are fucked
          change.updateType ? (
            <>
              {/*
              // @ts-ignore types are fucked */}
              {t(change.updateType)}: {truncateMiddle(change.market.id)}
            </>
          ) : null}
        </span>
      );
      break;
    }
    case 'UpdateMarket': {
      fallbackTitle = t('UpdateMarketProposal');
      details = (
        <>
          <span>{t('UpdateToMarket')}:</span>{' '}
          <span className="inline-flex items-start gap-2">
            <span className="break-all">{change.marketId} </span>
            <span className="inline-flex items-end gap-0">
              <CopyWithTooltip
                text={change.marketId}
                description={t('copyToClipboard')}
              >
                <button className="inline-block px-1">
                  <VegaIcon size={20} name={VegaIconNames.COPY} />
                </button>
              </CopyWithTooltip>
              <Tooltip description={t('OpenInConsole')} align="center">
                <button
                  className="inline-block px-1"
                  onClick={() => {
                    const marketPageLink = consoleLink(
                      CONSOLE_MARKET_PAGE.replace(':marketId', change.marketId)
                    );
                    window.open(marketPageLink, '_blank');
                  }}
                >
                  <VegaIcon size={20} name={VegaIconNames.OPEN_EXTERNAL} />
                </button>
              </Tooltip>
            </span>
          </span>
        </>
      );
      break;
    }
    case 'UpdateReferralProgram': {
      fallbackTitle = t('UpdateReferralProgramProposal');
      break;
    }
    case 'UpdateVolumeDiscountProgram': {
      fallbackTitle = t('UpdateVolumeDiscountProgramProposal');
      break;
    }
    case 'NewAsset': {
      fallbackTitle = t('NewAssetProposal');
      details = (
        <>
          <span>{t('Symbol')}:</span> <Lozenge>{change.symbol}.</Lozenge>{' '}
          {change.source.__typename === 'ERC20' && (
            <>
              <span>{t('ERC20ContractAddress')}:</span>{' '}
              <Lozenge>{change.source.contractAddress}</Lozenge>
            </>
          )}{' '}
          {change.source.__typename === 'BuiltinAsset' && (
            <>
              <span>{t('MaxFaucetAmountMint')}:</span>{' '}
              <Lozenge>{change.source.maxFaucetAmountMint}</Lozenge>
            </>
          )}
        </>
      );
      break;
    }
    case 'UpdateNetworkParameter': {
      fallbackTitle = t('NetworkParameterProposal');
      details = (
        <>
          <span>{t('Change')}:</span>{' '}
          <Lozenge>{change.networkParameter.key}</Lozenge>{' '}
          <span>{t('to')}</span>{' '}
          <span className="whitespace-nowrap">
            <Lozenge>{change.networkParameter.value}</Lozenge>
          </span>
        </>
      );
      break;
    }
    case 'NewFreeform': {
      fallbackTitle = t('FreeformProposal');
      details = <span />;
      break;
    }
    case 'UpdateAsset': {
      fallbackTitle = t('UpdateAssetProposal');
      details = (
        <>
          <span>{t('AssetID')}:</span>{' '}
          <Lozenge>{truncateMiddle(change.assetId)}</Lozenge>
        </>
      );
      break;
    }
    case 'NewTransfer':
      fallbackTitle = t('NewTransferProposal');
      details = featureFlags.GOVERNANCE_TRANSFERS ? (
        <NewTransferSummary proposalId={proposal?.id} />
      ) : null;
      break;
    case 'CancelTransfer':
      fallbackTitle = t('CancelTransferProposal');
      details = featureFlags.GOVERNANCE_TRANSFERS ? (
        <CancelTransferSummary proposalId={proposal?.id} />
      ) : null;
      break;
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
            <CurrentProposalState proposal={proposal} />
          </div>
        </div>
      </div>

      <div data-testid="proposal-title" className="break-all">
        {isListItem ? (
          <header>
            <SubHeading
              title={titleContent || fallbackTitle || t('Unknown proposal')}
            />
          </header>
        ) : (
          <Heading
            title={titleContent || fallbackTitle || t('Unknown proposal')}
          />
        )}
      </div>

      {details && (
        <div
          data-testid="proposal-details"
          className="break-words mb-6 text-vega-light-200"
        >
          {details}
        </div>
      )}

      {/* TODO: fix type cast */}
      <VoteBreakdown proposal={proposal as Proposal} />
    </>
  );
};

// const BatchProposalHeader = ({
//   proposal,
//   isListItem,
//   voteState,
// }: {
//   proposal: BatchProposal | ListBatchProposal;
//   isListItem?: boolean;
//   voteState?: VoteState | null;
// }) => {
//   return <div>TODO: handle batch header proposal</div>;
// };

export const SuccessorCode = ({
  proposalId,
}: {
  proposalId?: string | null;
}) => {
  const { t } = useTranslation();
  const successor = useSuccessorMarketProposalDetails(proposalId);

  return successor.parentMarketId || successor.code ? (
    <span className="block" data-testid="proposal-successor-info">
      {t('Successor market to')}:{' '}
      <Link
        to={`${Routes.PROPOSALS}/${successor.parentMarketId}`}
        className="hover:underline"
      >
        {successor.code || successor.parentMarketId}
      </Link>
    </span>
  ) : null;
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
      <Lozenge>
        {details.source
          ? truncateMiddle(details.source)
          : t(details.sourceType)}
      </Lozenge>{' '}
      {t('to')}{' '}
      <Lozenge>
        {details.destination
          ? truncateMiddle(details.destination)
          : t(details.destinationType)}
      </Lozenge>
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
      <Lozenge>{truncateMiddle(details.transferId)}</Lozenge>
    </span>
  );
};
