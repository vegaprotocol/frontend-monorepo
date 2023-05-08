import { useTranslation } from 'react-i18next';
import { Intent, Lozenge } from '@vegaprotocol/ui-toolkit';
import { shorten } from '@vegaprotocol/utils';
import { Heading, SubHeading } from '../../../../components/heading';
import type { ReactNode } from 'react';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import ReactMarkdown from 'react-markdown';
import { truncateMiddle } from '../../../../lib/truncate-middle';

export const ProposalHeader = ({
  proposal,
  isListItem = true,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
  isListItem?: boolean;
}) => {
  const { t } = useTranslation();
  const change = proposal?.terms.change;

  let details: ReactNode;
  let proposalType: ReactNode;

  let title = proposal?.rationale.title.trim();
  let description = proposal?.rationale.description.trim();
  if (title?.length === 0 && description && description.length > 0) {
    title = description;
    description = '';
  }

  const titleContent = shorten(title ?? '', 100);

  switch (change?.__typename) {
    case 'NewMarket': {
      proposalType = t('NewMarket');
      details = (
        <>
          {t('Code')}: {change.instrument.code}.{' '}
          {change.instrument.futureProduct?.settlementAsset.symbol ? (
            <>
              <span className="font-semibold">
                {change.instrument.futureProduct.settlementAsset.symbol}
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
    case 'UpdateMarket': {
      proposalType = t('UpdateMarket');
      details = `${t('Market change')}: ${change.marketId}`;
      break;
    }
    case 'NewAsset': {
      proposalType = t('NewAsset');
      details = (
        <>
          {t('Symbol')}: {change.symbol}.{' '}
          <Lozenge>
            {change.source.__typename === 'ERC20' &&
              `ERC20 ${change.source.contractAddress}`}
            {change.source.__typename === 'BuiltinAsset' &&
              `${t('Max faucet amount mint')}: ${
                change.source.maxFaucetAmountMint
              }`}
          </Lozenge>
        </>
      );
      break;
    }
    case 'UpdateNetworkParameter': {
      proposalType = t('NetworkParameter');
      const parametersClasses = 'font-mono leading-none';
      details = (
        <>
          <span className={`${parametersClasses} mr-2`}>
            {change.networkParameter.key}
          </span>{' '}
          {t('to')}{' '}
          <span className={`${parametersClasses} ml-2`}>
            {change.networkParameter.value}
          </span>
        </>
      );
      break;
    }
    case 'NewFreeform': {
      proposalType = t('Freeform');
      details = `${t('FreeformProposal')}: ${proposal?.id}`;
      break;
    }
    case 'UpdateAsset': {
      proposalType = t('UpdateAsset');
      details = (
        <>
          <span>{t('Asset ID')}:</span>
          <Lozenge>{truncateMiddle(change.assetId)}</Lozenge>
        </>
      );
      break;
    }
  }

  return (
    <div className="text-sm mb-2">
      <div data-testid="proposal-title">
        {isListItem ? (
          <header>
            <SubHeading title={titleContent || t('Unknown proposal')} />
          </header>
        ) : (
          <Heading title={titleContent || t('Unknown proposal')} />
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {proposalType && (
          <div data-testid="proposal-type">
            <Lozenge variant={Intent.None}>{proposalType}</Lozenge>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {description && !isListItem && (
          <div data-testid="proposal-description" className="mb-4">
            <ReactMarkdown
              className="react-markdown-container"
              /* Prevents HTML embedded in the description from rendering */
              skipHtml={true}
              /* Stops users embedding images which could be used for tracking  */
              disallowedElements={['img']}
              linkTarget="_blank"
            >
              {description}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {details && <div data-testid="proposal-details">{details}</div>}
    </div>
  );
};
