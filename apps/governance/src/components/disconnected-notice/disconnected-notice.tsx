import { useTranslation } from 'react-i18next';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';

interface DisconnectedNoticeProps {
  isDisconnected: boolean;
  correctNetworkChainId?: string | null;
}

export const DisconnectedNotice = ({
  isDisconnected,
  correctNetworkChainId,
}: DisconnectedNoticeProps) => {
  const { t } = useTranslation();

  if (
    !isDisconnected ||
    correctNetworkChainId === undefined ||
    correctNetworkChainId === null
  ) {
    return null;
  }

  return (
    <div className="col-span-full" data-testid="disconnected-notice">
      <Notification
        message={t('disconnectedNotice', {
          correctNetwork: correctNetworkChainId,
        })}
        intent={Intent.Danger}
      />
    </div>
  );
};
