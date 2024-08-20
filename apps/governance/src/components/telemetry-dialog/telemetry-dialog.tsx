import { create } from 'zustand';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Button, Intent } from '@vegaprotocol/ui-toolkit';
import { Networks, useEnvironment } from '@vegaprotocol/environment';

type TelemetryDialogState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const useTelemetryDialogStore = create<TelemetryDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const TELEMETRY_ON = 'vega_telemetry_on';

export const useTelemetryDialog = () => {
  const [telemetryOn, setTelemetryOn] = useLocalStorage(TELEMETRY_ON);
  const { VEGA_ENV } = useEnvironment();
  const isMainnet = VEGA_ENV === Networks.MAINNET;

  const defaultTelemetryAccepted = isMainnet ? 'false' : 'true';

  const { isOpen, open, close } = useTelemetryDialogStore();

  useEffect(() => {
    if (telemetryOn === null || telemetryOn === undefined) {
      open();
      setTelemetryOn(defaultTelemetryAccepted);
    }
  }, [defaultTelemetryAccepted, open, setTelemetryOn, telemetryOn]);

  return {
    isOpen,
    open: open,
    close: close,
    telemetryAccepted: telemetryOn === 'true',
    setTelemetryAccepted: (value: boolean) => {
      setTelemetryOn(value.toString());
    },
  };
};

export const TelemetryDialog = () => {
  const { t } = useTranslation();
  const { isOpen, open, close, telemetryAccepted, setTelemetryAccepted } =
    useTelemetryDialog();
  return (
    <Dialog
      title={t('ImproveVegaGovernance')}
      open={isOpen}
      onChange={(isOpen) => (isOpen ? open() : close())}
      size="small"
    >
      <div className="mt-6">{t('TelemetryModalIntro')}</div>
      <div className="flex items-center mt-6">
        <Icon name="eye-off" className="mr-6" size={6} />
        <div className="flex flex-col gap-1">
          <div className="font-semibold">{t('Anonymous')}</div>
          <div>{t('YourIdentityAnonymous')}</div>
        </div>
      </div>

      <div className="flex items-center mt-6">
        <Icon name="cog" className="mr-6" size={6} />
        <div className="flex flex-col gap-1">
          <div className="font-semibold">{t('Optional')}</div>
          <div>{t('OptOutOfTelemetry')}</div>
        </div>
      </div>

      <div className="flex items-center mt-10 gap-4">
        <Button
          onClick={() => {
            setTelemetryAccepted(true);
            close();
          }}
          intent={Intent.Primary}
          data-testid="share-data-button"
        >
          {telemetryAccepted ? t('ContinueSharingData') : t('ShareData')}
        </Button>

        <Button
          onClick={() => {
            setTelemetryAccepted(false);
            close();
          }}
          data-testid="do-not-share-data-button"
        >
          {t('NoThanks')}
        </Button>
      </div>
    </Dialog>
  );
};
