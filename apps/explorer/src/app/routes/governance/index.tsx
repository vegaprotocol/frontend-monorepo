import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { useExplorerProposalsQuery } from './__generated__/Proposals';
import { useDocumentTitle } from '../../hooks/use-document-title';
import EmptyList from '../../components/empty-list/empty-list';

const Governance = () => {
  const { data, loading } = useExplorerProposalsQuery({
    errorPolicy: 'ignore',
  });

  useDocumentTitle();

  if (!data || !data.proposalsConnection || !data.proposalsConnection.edges) {
    if (!loading) {
      return (<EmptyList
        heading={t('This chain has no proposals')}
        label={t('0 proposals')} />)
    } else {
      return (<span>{t('Loading')}</span>)
    } 
  }

  const proposals = data?.proposalsConnection?.edges.map((e) => {
    return e?.node;
  });

  return (
    <section>
      <RouteTitle data-testid="governance-header">
        {t('Governance Proposals')}
      </RouteTitle>
      {proposals.map((p) => {
        if (!p || !p.id) {
          return null;
        }

        return (
          <React.Fragment key={p.id}>
            <SubHeading>
              {p.rationale.title || p.rationale.description}
            </SubHeading>
            <SyntaxHighlighter data={p} />
          </React.Fragment>
        );
      })}
    </section>
  );
};

export default Governance;
