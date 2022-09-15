import { useTranslation } from 'react-i18next';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import { isAssetTypeERC20, isAssetTypeBuiltIn } from '@vegaprotocol/react-helpers';
import type { ProposalFieldsFragment } from '@vegaprotocol/governance';
import type { ReactNode } from 'react';
import { shorten } from '@vegaprotocol/react-helpers';

export const ProposalHeader = ({ proposal }: { proposal: ProposalFieldsFragment }) => {
  const { t } = useTranslation();
  const { change } = proposal.terms;

  let details: ReactNode;

  let title = proposal.rationale.title.trim();
  let description = proposal.rationale.description.trim();
  if (title.length === 0 && description.length > 0) {
    title = description;
    description = '';
  }

  const titleContent = shorten(title, 100);
  const descriptionContent = shorten(description, 60);

  switch (change.__typename) {
    case 'NewMarket': {
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
      details = `${t('Market change')}: ${change.marketId}`;
      break;
    }
    case 'NewAsset': {
      details = (
        <>
          {t('Symbol')}: {change.symbol}.{' '}
          <Lozenge>
            {isAssetTypeERC20(change.source) && `ERC20 ${change.source.contractAddress}`}
            {isAssetTypeBuiltIn(change.source) && `${t('Max faucet amount mint')}: ${change.source.maxFaucetAmountMint}`}
          </Lozenge>
        </>
      );
      break;
    }
    case 'UpdateNetworkParameter': {
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
      details = `${proposal.id}`;

      break;
    }
  }

  return (
    <div className="text-sm mb-2">
      <header data-testid="proposal-title">
        <h2
          {...(title && title.length > titleContent.length && { title: title })}
          className="text-lg mx-0 mt-0 mb-1 font-semibold"
        >
          {titleContent || t('Unknown proposal')}
        </h2>
      </header>
      {descriptionContent && (
        <div
          className="mb-4"
          {...(description.length > descriptionContent.length && {
            title: description,
          })}
          data-testid="proposal-description"
        >
          {descriptionContent}
        </div>
      )}
      {details && <div data-testid="proposal-details">{details}</div>}
    </div>
  );
};
