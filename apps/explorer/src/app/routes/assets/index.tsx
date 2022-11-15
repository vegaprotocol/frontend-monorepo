import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { useExplorerAssetsQuery } from './__generated__/assets';

const Assets = () => {
  const { data } = useExplorerAssetsQuery();

  const assets = data?.assetsConnection?.edges?.map((n) => {
    return n?.node;
  });

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
            <SubHeading data-testid="asset-header">
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
