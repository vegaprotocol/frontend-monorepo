import { useTranslation } from 'react-i18next';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { Row } from '@vegaprotocol/markets';
import { useState } from 'react';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { SubHeading } from '../../../../components/heading';
import { type UpdateMarketStatesFragment } from '../../__generated__/Proposals';
import { MarketUpdateTypeMapping } from '@vegaprotocol/types';
import { MarketName } from '../proposal/market-name';

interface ProposalUpdateMarketStateProps {
  change: UpdateMarketStatesFragment | null;
}

export const ProposalUpdateMarketState = ({
  change,
}: ProposalUpdateMarketStateProps) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  if (!change || change.__typename !== 'UpdateMarketState') {
    return null;
  }

  const market = change?.market;
  const isTerminate =
    change?.updateType === 'MARKET_STATE_UPDATE_TYPE_TERMINATE';

  let toggleTitle = t(change.updateType);
  if (toggleTitle.length === 0) {
    toggleTitle = t('MarketDetails');
  }

  return (
    <section className="relative" data-testid="proposal-update-market-state">
      <CollapsibleToggle
        toggleState={showDetails}
        setToggleState={setShowDetails}
        dataTestId="proposal-market-data-toggle"
      >
        <SubHeading
          title={
            <>
              {toggleTitle}: <MarketName marketId={market?.id} />
            </>
          }
        />
      </CollapsibleToggle>

      {showDetails && (
        <RoundedWrapper paddingBottom={true} marginBottomLarge={true}>
          {change.__typename === 'UpdateMarketState' && (
            <KeyValueTable data-testid="proposal-update-market-state-table">
              <KeyValueTableRow>
                {t('marketId')}
                {market?.id}
              </KeyValueTableRow>
              <KeyValueTableRow>
                {t('State')}
                <span className="bg-vega-green-650 px-1">
                  {MarketUpdateTypeMapping[change.updateType]}
                </span>
              </KeyValueTableRow>
              <KeyValueTableRow>
                {t('marketName')}
                {market?.tradableInstrument?.instrument?.name}
              </KeyValueTableRow>
              <KeyValueTableRow noBorder={!isTerminate}>
                {t('marketCode')}
                {market?.tradableInstrument?.instrument?.code}
              </KeyValueTableRow>
              {isTerminate && market && (
                <Row
                  field="termination-price"
                  value={change?.price}
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
