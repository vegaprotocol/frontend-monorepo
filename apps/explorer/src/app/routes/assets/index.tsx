import { getNodes, t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { useExplorerAssetsQuery } from './__generated__/Assets';
import type { AssetsFieldsFragment } from './__generated__/Assets';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import EmptyList from '../../components/empty-list/empty-list';

const Assets = () => {
  const { data, loading } = useExplorerAssetsQuery();
  useDocumentTitle(['Assets']);

  useScrollToLocation();

  const assets = getNodes<AssetsFieldsFragment>(data?.assetsConnection);

  if (!assets || assets.length === 0) {
    if (!loading) {
      return (<EmptyList
        heading={t('This chain has no assets')}
        label={t('0 assets')} />)
    } else {
      return (<span>{t('Loading')}</span>)
    }
  }

  return (
    <section>
      <RouteTitle data-testid="assets-header">{t('Assets')}</RouteTitle>
      {assets.map((a) => {
        return (
          <React.Fragment key={a.id}>
            <SubHeading data-testid="asset-header" id={a.id}>
              {a.name} ({a.symbol})
            </SubHeading>
            <SyntaxHighlighter data={a} />
          </React.Fragment>
        );
      })}
    </section>
  );
};

export default Assets;
