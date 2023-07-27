import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../../components/heading';
import { ProposalsListItem } from '../proposals-list-item';
import { ProposalsListFilter } from '../proposals-list-filter';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';

interface ProposalsListProps {
  proposals: Array<ProposalQuery['proposal'] | ProposalFieldsFragment>;
}

export const RejectedProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();
  const {
    params: networkParams,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParams([
    NetworkParams.governance_proposal_market_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajorityLP,
    NetworkParams.governance_proposal_asset_requiredMajority,
    NetworkParams.governance_proposal_updateAsset_requiredMajority,
    NetworkParams.governance_proposal_updateNetParam_requiredMajority,
    NetworkParams.governance_proposal_freeform_requiredMajority,
  ]);
  const [filterString, setFilterString] = useState('');

  const filterPredicate = (
    p: ProposalFieldsFragment | ProposalQuery['proposal']
  ) =>
    p?.id?.includes(filterString) ||
    p?.party?.id?.toString().includes(filterString);

  return (
    <AsyncRenderer
      loading={networkParamsLoading}
      error={networkParamsError}
      data={networkParams}
    >
      <Heading title={t('pageTitleRejectedProposals')} />
      <ProposalsListFilter
        filterString={filterString}
        setFilterString={setFilterString}
      />
      <section>
        {proposals.length > 0 ? (
          <ul data-testid="rejected-proposals">
            {proposals.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem
                key={proposal?.id}
                proposal={proposal}
                networkParams={networkParams}
              />
            ))}
          </ul>
        ) : (
          <p className="mb-0" data-testid="no-rejected-proposals">
            {t('noRejectedProposals')}
          </p>
        )}
      </section>
    </AsyncRenderer>
  );
};
