import { t } from '@vegaprotocol/i18n';
import {
  Button,
  Link,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { RISK_ACCEPTED_KEY } from '../constants';
import { TelemetryApproval } from './telemetry-approval';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { createDocsLinks, ExternalLinks } from '@vegaprotocol/utils';

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
        <MainnetContent />
      ) : (
        <TestnetContent network={network} />
      )}
      <div className="my-4">
        <TelemetryApproval
          helpText={t(
            'Help identify bugs and improve the service by sharing anonymous usage data. You can change this in your settings at any time.'
          )}
        />
      </div>
      <Button onClick={handleAcceptRisk}>
        {network === Networks.MAINNET
          ? t('I understand, Continue')
          : t('Continue')}
      </Button>
    </>
  );
};

const TestnetContent = ({ network }: { network: Networks }) => {
  const { GITHUB_FEEDBACK_URL, VEGA_DOCS_URL } = useEnvironment();
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
      {GITHUB_FEEDBACK_URL && VEGA_DOCS_URL && (
        <ul className="list-disc pl-4">
          <li className="mb-1">
            <Link href={ExternalLinks.VEGA_WALLET_URL} target="_blank">
              <span className="underline">{t('Get a Vega Wallet')}</span>{' '}
              <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
            </Link>
          </li>
          <li className="mb-1">
            <Link
              href={createDocsLinks(VEGA_DOCS_URL).VEGA_WALLET_TOOLS_URL}
              target="_blank"
            >
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
    </>
  );
};

const MainnetContent = () => {
  return (
    <>
      <h4 className="text-xl mb-2 mt-4">
        {t('Regulation may apply to use of this app')}
      </h4>
      <p className="mb-6">
        {t(
          'This decentralised application allows you to connect to and use publicly available blockchain services operated by third parties that may include trading, financial products, or other services that may be subject to legal and regulatory restrictions in your jurisdiction. This application is a front end only and does not hold any funds or provide any products or services. It is available to anyone with an internet connection via IPFS and other methods, and the ability to access it does not imply any right to use any services or that it is legal for you to do so. By using this application you accept that it is your responsibility to ensure that your use of the application and any blockchain services accessed through it is compliant with applicable laws and regulations in your jusrisdiction.'
        )}
      </p>
      <h4 className="text-xl mb-2">
        {t('Technical and financial risk of loss')}
      </h4>
      <p className="mb-8">
        {t(
          'The public blockchain services accessible via this decentralised application are operated by third parties and may carry significant risks including the potential loss of all funds that you deposit or hold with these services. Technical risks include the risk of loss in the event of the failure or compromise of the public blockchain infrastructure or smart contracts that provide any services you use. Financial risks include but are not limited to losses due to volatility, excessive leverage, low liquidity, and your own lack of understanding of the services you use. By using this decentralised application you accept that it is your responsibility to ensure that you understand any services you use and the technical and financial risks inherent in your use. Do not risk what you cannot afford to lose.'
        )}
      </p>
    </>
  );
};
