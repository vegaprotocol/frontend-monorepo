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
    <Button onClick={refresh} data-testid="refresh" size="xs">
      <Icon name="refresh" className="!align-baseline mr-2" size={3} />
      {t('Load new')}
    </Button>
  );
};
