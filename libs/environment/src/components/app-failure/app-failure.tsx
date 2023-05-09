import { t } from '@vegaprotocol/i18n';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useNodeSwitcherStore } from '../../hooks/use-node-switcher-store';

export const AppFailure = ({
  title,
  error,
}: {
  title: string;
  error?: string | null;
}) => {
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  const nonIdealWrapperClasses =
    'h-full min-h-screen flex items-center justify-center';
  return (
    <div className={nonIdealWrapperClasses}>
      <div className="text-center">
        <p className="text-xl mb-4">{title}</p>
        {error && <p className="text-sm mb-8">{error}</p>}
        <Button onClick={() => setNodeSwitcher(true)}>
          {t('Change node')}
        </Button>
      </div>
    </div>
  );
};
