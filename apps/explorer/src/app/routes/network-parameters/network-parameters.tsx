import startCase from 'lodash/startCase';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import {
  AsyncRenderer,
  KeyValueTableRow,
  SyntaxHighlighter,
} from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  formatNumber,
  removePaginationWrapper,
  suitableForSyntaxHighlighter,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../components/route-title';
import { useNetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { structureNetworkParams } from './structure-network-params';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import type { GroupedParams } from './structure-network-params';

const PERCENTAGE_PARAMS = [
  'governance.proposal.asset.requiredMajority',
  'governance.proposal.asset.requiredParticipation',
  'governance.proposal.updateAsset.requiredParticipation',
  'governance.proposal.freeform.requiredMajority',
  'governance.proposal.freeform.requiredParticipation',
  'governance.proposal.market.requiredMajority',
  'governance.proposal.market.requiredParticipation',
  'governance.proposal.updateMarket.requiredMajority',
  'governance.proposal.updateMarket.requiredMajorityLP',
  'governance.proposal.updateMarket.requiredParticipation',
  'governance.proposal.updateMarket.requiredParticipationLP',
  'governance.proposal.updateNetParam.requiredMajority',
  'governance.proposal.updateNetParam.requiredParticipation',
  'governance.proposal.updateMarket.minProposerEquityLikeShare',
  'validators.vote.required',
];

const BIG_NUMBER_PARAMS = [
  'spam.protection.delegation.min.tokens',
  'validators.delegation.minAmount',
  'reward.staking.delegation.minimumValidatorStake',
  'reward.staking.delegation.maxPayoutPerParticipant',
  'reward.staking.delegation.maxPayoutPerEpoch',
  'spam.protection.voting.min.tokens',
  'governance.proposal.freeform.minProposerBalance',
  'governance.proposal.updateNetParam.minVoterBalance',
  'governance.proposal.updateMarket.minVoterBalance',
  'governance.proposal.asset.minVoterBalance',
  'governance.proposal.updateNetParam.minProposerBalance',
  'governance.proposal.freeform.minVoterBalance',
  'spam.protection.proposal.min.tokens',
  'governance.proposal.updateMarket.minProposerBalance',
  'governance.proposal.asset.minProposerBalance',
  'governance.proposal.market.minProposerBalance',
  'governance.proposal.market.minVoterBalance',
  'governance.proposal.updateAsset.minProposerBalance',
  'governance.proposal.updateAsset.minVoterBalance',
];

export const renderGroupedParams = (
  group: GroupedParams,
  level: number,
  parentKeys: string[] = []
) => {
  const Header = `h${level}` as keyof JSX.IntrinsicElements;
  const headerStyles = classNames('uppercase font-semibold', {
    'pt-6 text-3xl underline': level === 1,
    'pt-3 text-2xl': level === 2,
    'pt-2 text-lg': level === 3,
    'pt-2 text-default': level === 4,
  });

  return Object.entries(group).map(([key, value]) => {
    const fullPath = [...parentKeys, key].join('.');
    const isLeafNode = typeof value !== 'object';
    const id = parentKeys.concat([key]).join('-');

    return (
      <div key={key}>
        {!isLeafNode && (
          <div id={id}>
            <Link to={`#${id}`}>
              <Header className={headerStyles} data-testid={id}>
                {startCase(key)}
              </Header>
            </Link>
          </div>
        )}
        {isLeafNode ? (
          typeof value === 'string' ? (
            <div data-testid={id}>
              <NetworkParameterRow
                key={fullPath}
                row={{ key: fullPath, value: value }}
              />
            </div>
          ) : null
        ) : (
          <div className="pb-1">
            {renderGroupedParams(value, level + 1, [...parentKeys, key])}
          </div>
        )}
      </div>
    );
  });
};

export const NetworkParameterRow = ({
  row: { key, value },
}: {
  row: { key: string; value: string };
}) => {
  const isSyntaxRow = suitableForSyntaxHighlighter(value);
  useDocumentTitle(['Network Parameters']);

  return (
    <KeyValueTableRow
      key={key}
      inline={!isSyntaxRow}
      id={key}
      className={
        'group focus:bg-vega-pink focus:text-white dark:focus:bg-vega-yellow dark:focus:text-black'
      }
    >
      {key}
      {isSyntaxRow ? (
        <div className="pb-2">
          <SyntaxHighlighter data={JSON.parse(value)} />
        </div>
      ) : isNaN(Number(value)) ? (
        value
      ) : BIG_NUMBER_PARAMS.includes(key) ? (
        addDecimalsFormatNumber(Number(value), 18)
      ) : PERCENTAGE_PARAMS.includes(key) ? (
        `${formatNumber(Number(value) * 100, 0)}%`
      ) : (
        formatNumber(Number(value), 4)
      )}
    </KeyValueTableRow>
  );
};

export interface NetworkParametersTableProps
  extends React.HTMLAttributes<HTMLTableElement> {
  data?: NetworkParamsQuery | undefined;
  error?: Error;
  loading: boolean;
}

export const NetworkParametersTable = ({
  data,
  error,
  loading,
}: NetworkParametersTableProps) => (
  <section>
    <RouteTitle data-testid="network-param-header">
      {t('Network Parameters')}
    </RouteTitle>

    <AsyncRenderer
      data={data}
      loading={loading}
      error={error}
      render={(data) => {
        const flatParams = removePaginationWrapper(
          data.networkParametersConnection.edges
        );
        const groupedParams = structureNetworkParams(flatParams);
        return (
          <div className="-mt-6">{renderGroupedParams(groupedParams, 1)}</div>
        );
      }}
    />
  </section>
);

export const NetworkParameters = () => {
  const { data, loading, error } = useNetworkParamsQuery();
  useScrollToLocation();
  return <NetworkParametersTable data={data} error={error} loading={loading} />;
};
