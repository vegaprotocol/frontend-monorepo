import { t } from '@vegaprotocol/i18n';
import { Button, Icon } from '@vegaprotocol/ui-toolkit';

interface BlocksRefetchProps {
  refetch: () => void;
}

export const BlocksRefetch = ({ refetch }: BlocksRefetchProps) => {
  const refresh = () => {
    refetch();
  };

  return (
    <Button
      onClick={refresh}
      data-testid="refresh"
      size="xs"
      className="dark:text-white"
    >
      <Icon name="refresh" size={3} />
      {t('Load new')}
    </Button>
  );
};
