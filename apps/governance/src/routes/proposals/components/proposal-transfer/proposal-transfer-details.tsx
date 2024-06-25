import { useState } from 'react';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { SubHeading } from '../../../../components/heading';
import { useTranslation } from 'react-i18next';
import {
  CopyWithTooltip,
  ExternalLink,
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
  Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import { useNewTransferProposalDetails } from '@vegaprotocol/proposals';
import {
  AccountTypeMapping,
  DescriptionGovernanceTransferTypeMapping,
  type DispatchStrategy,
  GovernanceTransferKindMapping,
  GovernanceTransferTypeMapping,
  DispatchMetricLabels,
  DispatchMetricDescription,
  DistributionStrategyMapping,
  DistributionStrategyDescriptionMapping,
  EntityScopeLabelMapping,
  EntityScopeMapping,
  IndividualScopeMapping,
  IndividualScopeDescriptionMapping,
} from '@vegaprotocol/types';
import {
  addDecimalsFormatNumberQuantum,
  formatDateWithLocalTimezone,
  toBigNum,
} from '@vegaprotocol/utils';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { DApp, EXPLORER_ASSET, useLinks } from '@vegaprotocol/environment';
import compact from 'lodash/compact';

const DispatchStrategyDetails = ({
  dispatchStrategy,
}: {
  dispatchStrategy: DispatchStrategy;
}) => {
  const { t } = useTranslation();
  const explorerLink = useLinks(DApp.Explorer);
  const { data: assets } = useAssetsMapProvider();
  return (
    <>
      <KeyValueTableRow>
        {t('Dispatch metric')}
        <Tooltip
          description={
            DispatchMetricDescription[dispatchStrategy.dispatchMetric]
          }
        >
          <span>{DispatchMetricLabels[dispatchStrategy.dispatchMetric]}</span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Dispatch metric asset')}

        <span className="inline-flex gap-1">
          {assets?.[dispatchStrategy.dispatchMetricAssetId].symbol || ''}

          <CopyWithTooltip
            description={t('Copy asset id')}
            text={dispatchStrategy.dispatchMetricAssetId}
          >
            <button>
              <VegaIcon name={VegaIconNames.COPY} />
            </button>
          </CopyWithTooltip>

          <Tooltip description={t('View in explorer')}>
            <span>
              <ExternalLink
                href={explorerLink(
                  EXPLORER_ASSET.replace(
                    ':id',
                    dispatchStrategy.dispatchMetricAssetId
                  )
                )}
              >
                <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
              </ExternalLink>
            </span>
          </Tooltip>
        </span>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Distribution strategy')}

        <Tooltip
          description={
            DistributionStrategyDescriptionMapping[
              dispatchStrategy.distributionStrategy
            ]
          }
        >
          <span>
            {DistributionStrategyMapping[dispatchStrategy.distributionStrategy]}
          </span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Window length')}

        <Tooltip description={t('Number of epochs to evaluate the metric on')}>
          <span>{dispatchStrategy.windowLength}</span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Transfer interval')}

        <Tooltip
          description={t('Interval for the distribution of the transfer')}
        >
          <span>{dispatchStrategy.transferInterval}</span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Lock period')}

        <Tooltip
          description={t(
            'Number of epochs after distribution to delay vesting of rewards by'
          )}
        >
          <span>{dispatchStrategy.lockPeriod}</span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Staking requirement')}

        <Tooltip
          description={t(
            'Minimum number of governance tokens, e.g. VEGA, staked for a party to be considered eligible'
          )}
        >
          <span>
            {toBigNum(dispatchStrategy.stakingRequirement, 18).toString()}
          </span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Cap reward fee multiple')}

        <Tooltip
          description={t(
            'Optional multiplier on taker fees used to cap the rewards a party may receive in an epoch'
          )}
        >
          <span>{dispatchStrategy.capRewardFeeMultiple || '-'}</span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Notional time weighted average position requirement')}

        <Tooltip
          description={t(
            'Minimum notional time-weighted averaged position required for a party to be considered eligible'
          )}
        >
          <span>
            {dispatchStrategy.notionalTimeWeightedAveragePositionRequirement}
          </span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('N top performers')}

        <Tooltip
          description={t(
            'The proportion of the top performers in the team for a given metric to be averaged for the metric calculation if scope is team'
          )}
        >
          <span>
            {dispatchStrategy.nTopPerformers
              ? (Number(dispatchStrategy.nTopPerformers) * 100).toFixed(2) + '%'
              : '-'}
          </span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Entity scope')}

        <Tooltip description={EntityScopeMapping[dispatchStrategy.entityScope]}>
          <span>{EntityScopeLabelMapping[dispatchStrategy.entityScope]}</span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Team scope')}

        <Tooltip
          description={t(
            'The teams in scope for the reward, if the entity is teams'
          )}
        >
          <span>
            {compact(dispatchStrategy.teamScope)
              ?.map((id) => truncateMiddle(id))
              .join(', ')}
          </span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Individual scope')}

        <Tooltip
          description={
            dispatchStrategy.individualScope &&
            (dispatchStrategy.individualScope as string) !==
              'INDIVIDUAL_SCOPE_UNSPECIFIED' &&
            IndividualScopeDescriptionMapping[dispatchStrategy.individualScope]
          }
        >
          <span>
            {dispatchStrategy.individualScope &&
            (dispatchStrategy.individualScope as string) !==
              'INDIVIDUAL_SCOPE_UNSPECIFIED'
              ? IndividualScopeMapping[dispatchStrategy.individualScope]
              : ''}
          </span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow>
        {t('Markets in scope')}

        <Tooltip
          description={t(
            'Scope the dispatch to this market only under the metric asset'
          )}
        >
          <span>
            {compact(dispatchStrategy.marketIdsInScope)
              ?.map((id) => truncateMiddle(id))
              .join(', ')}
          </span>
        </Tooltip>
      </KeyValueTableRow>

      <KeyValueTableRow noBorder>
        {t('Rank table')}

        <Tooltip
          description={t(
            'Ascending order list of start rank and corresponding share ratio'
          )}
        >
          <span className="text-xs">
            {compact(dispatchStrategy.rankTable).length > 0 && (
              <table className="border-spacing-1">
                <thead>
                  <tr>
                    <th className="font-normal border-b p-0.5 pr-2">
                      {t('Start rank')}
                    </th>
                    <th className="font-normal border-b p-0.5">
                      {t('Share ratio')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compact(dispatchStrategy.rankTable).map(
                    ({ startRank, shareRatio }, i) => (
                      <tr key={i}>
                        <td className="text-right p-0.5 pr-2">{startRank}</td>
                        <td className="text-right p-0.5">{shareRatio}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </span>
        </Tooltip>
      </KeyValueTableRow>
    </>
  );
};

export const ProposalTransferDetails = ({
  proposalId,
}: {
  proposalId: string;
}) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  const details = useNewTransferProposalDetails(proposalId);
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
                  <KeyValueTableRow>
                    {t('End on')}
                    {details.kind.endEpoch}
                  </KeyValueTableRow>
                )}
                {details.kind.dispatchStrategy && (
                  <DispatchStrategyDetails
                    dispatchStrategy={details.kind.dispatchStrategy}
                  />
                )}
              </>
            )}
          </KeyValueTable>
        </RoundedWrapper>
      )}
    </>
  );
};
