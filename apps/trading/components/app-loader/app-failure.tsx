import { t } from '@vegaprotocol/utils';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useGlobalStore } from '../../stores';

export const AppFailure = ({
  title,
  error,
}: {
  title: string;
  error?: string | null;
}) => {
  const { setNodeSwitcher } = useGlobalStore((store) => ({
    nodeSwitcherOpen: store.nodeSwitcherDialog,
    setNodeSwitcher: (open: boolean) =>
      store.update({ nodeSwitcherDialog: open }),
  }));
  const nonIdealWrapperClasses =
    'h-full min-h-screen flex items-center justify-center';
  return (
    <div className={nonIdealWrapperClasses}>
      <div className="text-center">
        <h1 className="text-xl mb-4">{title}</h1>
        {error && <p className="text-sm mb-8">{error}</p>}
        <Button onClick={() => setNodeSwitcher(true)}>
          {t('Change node')}
        </Button>
      </div>
    </div>
  );
};
