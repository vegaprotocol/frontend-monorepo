import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import { shorten } from '@vegaprotocol/utils';
import { Heading, SubHeading } from '../../../../components/heading';
import type { ReactNode } from 'react';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { CurrentProposalState } from '../current-proposal-state';
import { ProposalInfoLabel } from '../proposal-info-label';

export const ProposalHeader = ({
  proposal,
  useSubHeading = true,
  smallText = true,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
  useSubHeading?: boolean;
  smallText?: boolean;
}) => {
  const { t } = useTranslation();
  const change = proposal?.terms.change;
  const inlineTitleClasses = 'uppercase mr-2';

  let details: ReactNode;
  let proposalType = '';

  let title = proposal?.rationale.title.trim();
  let description = proposal?.rationale.description.trim();
  if (title?.length === 0 && description && description.length > 0) {
    title = description;
    description = '';
  }

  const titleContent = shorten(title ?? '', 100);

  switch (change?.__typename) {
    case 'NewMarket': {
      proposalType = 'NewMarket';
      details = (
        <>
          <span className={inlineTitleClasses}>{t('NewMarket')}:</span>
          <span>
            {t('Code')}: {change.instrument.code}.
          </span>
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
      proposalType = 'UpdateMarket';
      details = (
        <>
          <span className={inlineTitleClasses}>{t('Market change')}:</span>
          <span>{change.marketId}</span>
        </>
      );
      break;
    }
    case 'NewAsset': {
      proposalType = 'NewAsset';
      details = (
        <>
          <span className={inlineTitleClasses}>{t('New asset')}:</span>
          <span>
            {t('Symbol')}: {change.symbol}.
          </span>{' '}
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
      proposalType = 'NetworkParameter';
      const parametersClasses = 'font-mono leading-none';
      details = (
        <>
          <span className="uppercase mr-2">{t('parameter')}:</span>
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
      proposalType = 'Freeform';
      details = <span />;
      break;
    }
    case 'UpdateAsset': {
      proposalType = 'UpdateAsset';
      details = (
        <>
          <span className="uppercase mr-2">{t('Update asset')}:</span>
          <Lozenge>{change.assetId}</Lozenge>
        </>
      );
      break;
    }
  }

  const proposalHeaderClasses = classnames('mb-2', {
    'text-sm': smallText,
    'text-base': !smallText,
  });

  return (
    <div className={proposalHeaderClasses}>
      <div data-testid="proposal-title">
        {useSubHeading ? (
          <header>
            <SubHeading title={titleContent || t('Unknown proposal')} />
          </header>
        ) : (
          <Heading title={titleContent || t('Unknown proposal')} />
        )}
      </div>

      <div className="flex gap-2 mb-5">
        <div data-testid="proposal-type">
          <ProposalInfoLabel>{t(`${proposalType}`)}</ProposalInfoLabel>
        </div>

        <div data-testid="proposal-state">
          <CurrentProposalState proposal={proposal} />
        </div>
      </div>

      {description && (
        <div data-testid="proposal-description" className="mb-3">
          <span className="uppercase mr-2">{t('ProposalDescription')}:</span>
          {description}
        </div>
      )}

      {details && <div data-testid="proposal-details">{details}</div>}
    </div>
  );
};
