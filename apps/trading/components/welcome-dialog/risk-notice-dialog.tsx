import { useCallback } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Button } from '@vegaprotocol/ui-toolkit';
import { LocalStorage } from '@vegaprotocol/utils';
import { RISK_ACCEPTED_KEY } from '../constants';
import { TelemetryApproval } from './telemetry-approval';

interface Props {
  onClose: () => void;
}
export const RiskNoticeDialog = ({ onClose }: Props) => {
  const handleAcceptRisk = useCallback(() => {
    onClose();
    LocalStorage.setItem(RISK_ACCEPTED_KEY, 'true');
  }, [onClose]);

  return (
    <>
      <h4 className="text-xl mb-2 mt-4">
        {t('Regulation may apply to use of this app')}
      </h4>
      <p className="text-base mb-6">
        {t(
          'This decentralised application allows you to connect to and use publicly available blockchain services operated by third parties that may include trading, financial products, or other services that may be subject to legal and regulatory restrictions in your jurisdiction. This application is a front end only and does not hold any funds or provide any products or services. It is available to anyone with an internet connection via IPFS and other methods, and the ability to access it does not imply any right to use any services or that it is legal for you to do so. By using this application you accept that it is your responsibility to ensure that your use of the application and any blockchain services accessed through it is compliant with applicable laws and regulations in your jusrisdiction.'
        )}
      </p>
      <h4 className="text-xl mb-2">
        {t('Technical and financial risk of loss')}
      </h4>
      <p className="text-base mb-8">
        {t(
          'The public blockchain services accessible via this decentralised application are operated by third parties and may carry significant risks including the potential loss of all funds that you deposit or hold with these services. Technical risks include the risk of loss in the event of the failure or compromise of the public blockchain infrastructure or smart contracts that provide any services you use. Financial risks include but are not limited to losses due to volatility, excessive leverage, low liquidity, and your own lack of understanding of the services you use. By using this decentralised application you accept that it is your responsibility to ensure that you understand any services you use and the technical and financial risks inherent in your use. Do not risk what you cannot afford to lose.'
        )}
      </p>
      <Button onClick={handleAcceptRisk}>{t('I understand, Continue')}</Button>
      <div className="text-base mt-8">
        <TelemetryApproval />
      </div>
    </>
  );
};
