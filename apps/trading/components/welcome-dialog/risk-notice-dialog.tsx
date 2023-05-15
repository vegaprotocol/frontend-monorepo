import { t } from '@vegaprotocol/i18n';
import {
  Button,
  ExternalLink,
  Icon,
  Link,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { RISK_ACCEPTED_KEY } from '../constants';
import { TelemetryApproval } from './telemetry-approval';
import {
  DOCS_VEGA_WALLET,
  GET_VEGA_WALLET_URL,
  Networks,
  useDocsLink,
  useEnvironment,
} from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useGlobalStore } from '../../stores';
import { useVegaWallet } from '@vegaprotocol/wallet';

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
    <>
      {network === Networks.MAINNET ? (
        <MainnetContent handleAcceptRisk={handleAcceptRisk} />
      ) : (
        <TestnetContent network={network} handleAcceptRisk={handleAcceptRisk} />
      )}
    </>
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
  const docsLink = useDocsLink();

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
      {GITHUB_FEEDBACK_URL && GET_VEGA_WALLET_URL && docsLink && (
        <ul className="list-disc pl-4">
          <li className="mb-1">
            <Link href={GET_VEGA_WALLET_URL} target="_blank">
              <span className="underline">{t('Get a Vega Wallet')}</span>{' '}
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
            </Link>
          </li>
          <li className="mb-1">
            <Link href={docsLink(DOCS_VEGA_WALLET)} target="_blank">
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

const MainnetContent = ({
  handleAcceptRisk,
}: {
  handleAcceptRisk: () => void;
}) => {
  const updateStore = useGlobalStore((store) => store.update);
  const { disconnect } = useVegaWallet();
  const revokeWalletConnection = () => {
    updateStore({ shouldDisplayMainnetRiskDialog: false });
    disconnect();
  };
  const openDisclaimer = () => {
    updateStore({ shouldDisplayDisclaimerDialog: true });
  };
  return (
    <div className="mt-6">
      <div className="bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 p-6 mb-6">
        <ul className="list-disc ml-6 text-lg">
          <li>
            {t(
              'No party hosts or operates this IFPS website or offers any financial advice'
            )}
          </li>
          <li>
            {t(
              'You may encounter bugs, loss of functionality or loss of assets'
            )}
          </li>
          <li>
            {t('No party accepts any liability for any losses whatsoever')}
          </li>
        </ul>
      </div>
      <p className="mb-8">
        {t(
          'By using the Vega Console, you acknowledge that you have read and understood the'
        )}{' '}
        <ExternalLink onClick={openDisclaimer} className="underline">
          <span className="flex items-center gap-2">
            <span>{t('Vega Console Disclaimer')}</span>
            <Icon name="arrow-top-right" size={3} />
          </span>
        </ExternalLink>
        .
      </p>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Button onClick={revokeWalletConnection} fill>
            {t('Cancel')}
          </Button>
        </div>
        <div>
          <Button onClick={handleAcceptRisk} variant="primary" fill>
            {t('I agree')}
          </Button>
        </div>
      </div>
    </div>
  );
};
