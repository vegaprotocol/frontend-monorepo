import { useTranslation } from 'react-i18next';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { Row } from '@vegaprotocol/markets';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { useState } from 'react';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { SubHeading } from '../../../../components/heading';

interface ProposalUpdateMarketStateProps {
  proposal: Extract<
    ProposalQuery['proposal'],
    { __typename?: 'Proposal' }
  > | null;
}

export const ProposalUpdateMarketState = ({
  proposal,
}: ProposalUpdateMarketStateProps) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  let market;
  let isTerminate = false;

  if (!proposal) {
    return null;
  }

  if (proposal?.terms.change.__typename === 'UpdateMarketState') {
    market = proposal?.terms?.change?.market;
    isTerminate =
      proposal?.terms?.change?.updateType ===
      'MARKET_STATE_UPDATE_TYPE_TERMINATE';
  }

  return (
    <section className="relative" data-testid="proposal-update-market-state">
      <CollapsibleToggle
        toggleState={showDetails}
        setToggleState={setShowDetails}
        dataTestId="proposal-market-data-toggle"
      >
        <SubHeading title={t('MarketDetails')} />
      </CollapsibleToggle>

      {showDetails && (
        <RoundedWrapper paddingBottom={true} marginBottomLarge={true}>
          {proposal?.terms.change.__typename === 'UpdateMarketState' && (
            <KeyValueTable data-testid="proposal-update-market-state-table">
              <KeyValueTableRow>
                {t('marketId')}
                {market?.id}
              </KeyValueTableRow>
              <KeyValueTableRow>
                {t('marketName')}
                {market?.tradableInstrument?.instrument?.name}
              </KeyValueTableRow>
              <KeyValueTableRow noBorder={!isTerminate}>
                {t('marketCode')}
                {market?.tradableInstrument?.instrument?.code}
              </KeyValueTableRow>
              {isTerminate && (
                <Row
                  field="termination-price"
                  value={proposal?.terms?.change?.price}
                  assetSymbol={
                    market?.tradableInstrument?.instrument?.product
                      ?.__typename === 'Future' ||
                    market?.tradableInstrument?.instrument?.product
                      ?.__typename === 'Perpetual'
                      ? market?.tradableInstrument?.instrument?.product
                          ?.quoteName
                      : undefined
                  }
                  decimalPlaces={market?.decimalPlaces}
                />
              )}
            </KeyValueTable>
          )}
        </RoundedWrapper>
      )}
    </section>
  );
};
