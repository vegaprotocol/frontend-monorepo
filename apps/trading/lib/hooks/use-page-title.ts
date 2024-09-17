import { useEffect, useMemo } from 'react';
import { titlefy } from '@vegaprotocol/utils';
import { usePageTitleStore } from '../../stores';
import { APP_NAME } from '../constants';

export const usePageTitle = (title: string | string[]) => {
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  const memotitle = useMemo(
    () => titlefy(APP_NAME, Array.isArray(title) ? title : [title]),
    [title]
  );

  useEffect(() => {
    updateTitle(memotitle);
  }, [updateTitle, memotitle]);
};
