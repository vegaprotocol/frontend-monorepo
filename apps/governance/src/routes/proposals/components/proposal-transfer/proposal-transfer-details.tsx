import { useState } from 'react';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { SubHeading } from '../../../../components/heading';
import { useTranslation } from 'react-i18next';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { useNewTransferProposalDetails } from '@vegaprotocol/proposals';
import {
  AccountTypeMapping,
  DescriptionGovernanceTransferTypeMapping,
  GovernanceTransferKindMapping,
  GovernanceTransferTypeMapping,
} from '@vegaprotocol/types';
import {
  addDecimalsFormatNumberQuantum,
  formatDateWithLocalTimezone,
} from '@vegaprotocol/utils';

export const ProposalTransferDetails = ({
  proposal,
}: {
  proposal:
    | ProposalFieldsFragment
    | Extract<ProposalQuery['proposal'], { __typename?: 'Proposal' }>;
}) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  const details = useNewTransferProposalDetails(proposal?.id);
  if (!details) {
    return null;
  }

  return (
    <>
      <CollapsibleToggle
        toggleState={show}
        setToggleState={setShow}
        dataTestId="proposal-transfer-details"
      >
        <SubHeading title={t('proposalTransferDetails')} />
      </CollapsibleToggle>
      {show && (
        <RoundedWrapper paddingBottom={true}>
          <KeyValueTable data-testid="proposal-transfer-details-table">
            {/* The source account */}
            <KeyValueTableRow>
              {t('Source')}
              {details.source}
            </KeyValueTableRow>

            {/* The type of source account */}
            <KeyValueTableRow>
              {t('Source Type')}
              {AccountTypeMapping[details.sourceType]}
            </KeyValueTableRow>

            {/* The destination account */}
            <KeyValueTableRow>
              {t('Destination')}
              {details.destination}
            </KeyValueTableRow>

            {/* The type of destination account */}
            <KeyValueTableRow>
              {t('Destination Type')}
              {AccountTypeMapping[details.destinationType]}
            </KeyValueTableRow>

            {/* The asset to transfer */}
            <KeyValueTableRow>
              {t('Asset')}
              {details.asset.symbol}
            </KeyValueTableRow>

            {/*The fraction of the balance to be transfer */}
            <KeyValueTableRow>
              {t('Fraction Of Balance')}
              {`${Number(details.fraction_of_balance) * 100}%`}
            </KeyValueTableRow>

            {/* The maximum amount to be transferred */}
            <KeyValueTableRow>
              {t('Amount')}
              {addDecimalsFormatNumberQuantum(
                details.amount,
                details.asset.decimals,
                details.asset.quantum
              )}
            </KeyValueTableRow>

            {/* The type of the governance transfer */}
            <KeyValueTableRow>
              {t('Transfer Type')}
              <Tooltip
                description={
                  DescriptionGovernanceTransferTypeMapping[details.transferType]
                }
              >
                <span>
                  {GovernanceTransferTypeMapping[details.transferType]}
                </span>
              </Tooltip>
            </KeyValueTableRow>

            {/* The type of governance transfer being made, i.e. a one-off or recurring trans */}
            <KeyValueTableRow>
              {t('Kind')}
              {GovernanceTransferKindMapping[details.kind.__typename]}
            </KeyValueTableRow>

            {details.kind.__typename === 'OneOffGovernanceTransfer' &&
              details.kind.deliverOn && (
                <KeyValueTableRow noBorder={true}>
                  {t('Deliver On')}
                  {formatDateWithLocalTimezone(
                    new Date(details.kind.deliverOn)
                  )}
                </KeyValueTableRow>
              )}

            {details.kind.__typename === 'RecurringGovernanceTransfer' && (
              <>
                <KeyValueTableRow noBorder={!details.kind.endEpoch}>
                  {t('Start On')}
                  <span>{details.kind.startEpoch}</span>
                </KeyValueTableRow>
                {details.kind.endEpoch && (
                  <KeyValueTableRow noBorder={true}>
                    {t('End on')}
                    {details.kind.endEpoch}
                  </KeyValueTableRow>
                )}
              </>
            )}
          </KeyValueTable>
        </RoundedWrapper>
      )}
    </>
  );
};
