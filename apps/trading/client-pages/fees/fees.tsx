import { FeesContainer } from '../../components/fees-container';
import { useT } from '../../lib/use-t';
import { usePageTitleStore } from '../../stores';
import { titlefy } from '@vegaprotocol/utils';
import { useEffect } from 'react';

export const Fees = () => {
  const t = useT();
  const title = t('Fees');
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));
  useEffect(() => {
    updateTitle(titlefy([title]));
  }, [updateTitle, title]);
  return (
    <div className="container p-4 mx-auto">
      <h1 className="px-4 pb-4 text-2xl">{title}</h1>
      <FeesContainer />
    </div>
  );
};
