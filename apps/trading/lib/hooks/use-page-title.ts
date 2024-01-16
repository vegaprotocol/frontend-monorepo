import { useEffect } from 'react';
import { titlefy } from '@vegaprotocol/utils';
import { usePageTitleStore } from '../../stores';

export const usePageTitle = (title: string | string[]) => {
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    updateTitle(titlefy(Array.isArray(title) ? title : [title]));
  }, [updateTitle, title]);
};
