import { TradingButton as Button, Intent } from '@vegaprotocol/ui-toolkit';
import { type ReactNode } from 'react';
import { useT } from '../../hooks/use-t';

export const RiskAck = ({
  children,
  onAccept,
  onReject,
}: {
  children: ReactNode;
  onAccept: () => void;
  onReject: () => void;
}) => {
  const t = useT();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('Understand the risk')}</h2>
      {children}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Button onClick={onReject} fill>
            {t('Cancel')}
          </Button>
        </div>
        <div>
          <Button onClick={onAccept} intent={Intent.Info} fill>
            {t('I agree')}
          </Button>
        </div>
      </div>
    </div>
  );
};
