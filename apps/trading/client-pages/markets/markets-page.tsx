import React, { useEffect } from 'react';
import { t, titlefy } from '@vegaprotocol/react-helpers';
import { Tabs, Tab } from '@vegaprotocol/ui-toolkit';
import { Markets } from './markets';
import { Proposed } from './proposed';
import { usePageTitleStore } from '../../stores';

export const MarketsPage = () => {
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));
  useEffect(() => {
    updateTitle(titlefy(['Markets']));
  }, [updateTitle]);
  return (
    <Tabs>
      <Tab id="active-markets" name={t('Active markets')}>
        <Markets />
      </Tab>
      <Tab id="proposed-markets" name={t('Proposed markets')}>
        <Proposed />
      </Tab>
    </Tabs>
  );
};
