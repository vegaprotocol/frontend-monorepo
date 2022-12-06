import { getNodes, t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { useExplorerAssetsQuery } from './__generated__/assets';
import type { AssetsFieldsFragment } from './__generated__/assets';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';

const Assets = () => {
  const { data } = useExplorerAssetsQuery();
  useDocumentTitle(['Assets']);

  useScrollToLocation();

  const assets = getNodes<AssetsFieldsFragment>(data?.assetsConnection);

  if (!assets || assets.length === 0) {
    return <section></section>;
  }

  return (
    <section>
      <RouteTitle data-testid="assets-header">{t('Assets')}</RouteTitle>
      {assets.map((a) => {
        if (!a) {
          return null;
        }

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
