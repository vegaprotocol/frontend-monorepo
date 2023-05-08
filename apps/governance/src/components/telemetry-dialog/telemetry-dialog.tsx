import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Button } from '@vegaprotocol/ui-toolkit';
import { Networks, useEnvironment } from '@vegaprotocol/environment';

export const TELEMETRY_DIALOG_PREVIOUSLY_OPENED =
  'telemetry_dialog_previously_opened';
export const TELEMETRY_ACCEPTED = 'telemetry_accepted';

export const useTelemetryDialog = () => {
  const [getPreviouslyOpened, setPreviouslyOpened] = useLocalStorage(
    TELEMETRY_DIALOG_PREVIOUSLY_OPENED
  );
  const [getTelemetryAccepted, setTelemetryAccepted] =
    useLocalStorage(TELEMETRY_ACCEPTED);

  const { VEGA_ENV } = useEnvironment();
  const isMainnet = VEGA_ENV === Networks.MAINNET;

  const defaultTelemetryAccepted = isMainnet ? 'false' : 'true';

  const [isOpen, setIsOpen] = useState(
    !JSON.parse(getPreviouslyOpened || 'false')
  );
  const [telemetryAccepted, setTelemetryAcceptedState] = useState(
    JSON.parse(getTelemetryAccepted || defaultTelemetryAccepted)
  );

  useEffect(() => {
    if (getTelemetryAccepted === null || getTelemetryAccepted === undefined) {
      // Sets an initial value in local storage based on the network
      setTelemetryAccepted(defaultTelemetryAccepted);
    } else {
      // Ensures the component state is in sync with local storage
      setTelemetryAcceptedState(JSON.parse(getTelemetryAccepted));
    }
  }, [getTelemetryAccepted, setTelemetryAccepted, defaultTelemetryAccepted]);

  useEffect(() => {
    if (JSON.parse(getPreviouslyOpened || 'false') === false) {
      setIsOpen(true);
    }
  }, [getPreviouslyOpened]);

  const handleClose = () => {
    setPreviouslyOpened('true');
    setIsOpen(false);
  };

  const handleSetTelemetryAccepted = (value: boolean) => {
    setTelemetryAccepted(JSON.stringify(value));
    setTelemetryAcceptedState(value);
  };

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: handleClose,
    telemetryAccepted,
    setTelemetryAccepted: handleSetTelemetryAccepted,
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
            setTelemetryAccepted(false);
            close();
          }}
          variant={telemetryAccepted ? 'default' : 'primary'}
        >
          {t('NoThanks')}
        </Button>

        <Button
          onClick={() => {
            setTelemetryAccepted(true);
            close();
          }}
          variant={telemetryAccepted ? 'primary' : 'default'}
        >
          {telemetryAccepted ? t('ContinueSharingData') : t('ShareData')}
        </Button>
      </div>
    </Dialog>
  );
};
