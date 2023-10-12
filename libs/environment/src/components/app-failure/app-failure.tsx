import { t } from '@vegaprotocol/i18n';
import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { useNodeSwitcherStore } from '../../hooks/use-node-switcher-store';

export const AppFailure = ({
  title,
  error,
}: {
  title: string;
  error?: string | null;
}) => {
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  return (
    <Splash>
      <div className="text-center">
        <p className="mb-4 text-xl">{title}</p>
        {error && <p className="mb-8 text-sm">{error}</p>}
        <Button onClick={() => setNodeSwitcher(true)}>
          {t('Change node')}
        </Button>
      </div>
    </Splash>
  );
};
