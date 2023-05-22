import { t } from '@vegaprotocol/i18n';
import {
  Button,
  Link,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { RISK_ACCEPTED_KEY } from '../constants';
import { TelemetryApproval } from './telemetry-approval';
import type { Networks } from '@vegaprotocol/environment';
import {
  useEnvironment,
  DocsLinks,
  ExternalLinks,
} from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';

interface Props {
  onClose: () => void;
  network: Networks;
}
export const RiskNoticeDialog = ({ onClose, network }: Props) => {
  const [, setValue] = useLocalStorage(RISK_ACCEPTED_KEY);

  const handleAcceptRisk = () => {
    onClose();
    setValue('true');
  };

  return (
    <TestnetContent network={network} handleAcceptRisk={handleAcceptRisk} />
  );
};

const TestnetContent = ({
  network,
  handleAcceptRisk,
}: {
  network: Networks;
  handleAcceptRisk: () => void;
}) => {
  const { GITHUB_FEEDBACK_URL } = useEnvironment();
  return (
    <>
      <p className="mb-4">
        {t(
          'This application for trading on Vega is connected to %s, meaning you are free to try out trading with virtual assets and no risk.',
          [network]
        )}
      </p>
      <p className="mb-4">
        {t(
          'Your Vega wallet must also be connected to %s, and your Ethereum wallet must be connected to Sepolia.',
          [network]
        )}
      </p>
      {GITHUB_FEEDBACK_URL && DocsLinks && (
        <ul className="list-disc pl-4">
          <li className="mb-1">
            <Link href={ExternalLinks.VEGA_WALLET_URL} target="_blank">
              <span className="underline">{t('Get a Vega Wallet')}</span>{' '}
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
            </Link>
          </li>
          <li className="mb-1">
            <Link href={DocsLinks.VEGA_WALLET_TOOLS_URL} target="_blank">
              <span className="underline">{t('Learn about Vega Wallet')}</span>{' '}
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
            </Link>
          </li>
          <li className="mb-1">
            <Link href={GITHUB_FEEDBACK_URL} target="_blank">
              <span className="underline">{t('Provide feedback')}</span>{' '}
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
            </Link>
          </li>
        </ul>
      )}
      <div className="my-4">
        <TelemetryApproval
          helpText={t(
            'Help identify bugs and improve the service by sharing anonymous usage data. You can change this in your settings at any time.'
          )}
        />
      </div>
      <Button onClick={handleAcceptRisk}>{t('Continue')}</Button>
    </>
  );
};
