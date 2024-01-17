import { useEffect, useMemo } from 'react';
import { titlefy } from '@vegaprotocol/utils';
import { usePageTitleStore } from '../../stores';

export const usePageTitle = (title: string | string[]) => {
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  const memotitle = useMemo(
    () => titlefy(Array.isArray(title) ? title : [title]),
    [title]
  );

  useEffect(() => {
    updateTitle(memotitle);
  }, [updateTitle, memotitle]);
};
