import { useEnvironment, useNodeHealth } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import type { Intent } from '@vegaprotocol/ui-toolkit';
import { Indicator } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useGlobalStore } from '../../stores';
import { useCallback } from 'react';

export const Footer = () => {
  return (
    <footer className="px-4 py-1 text-xs border-t border-default text-vega-light-300 dark:text-vega-dark-300 lg:fixed bottom-0 left-0 border-r bg-white dark:bg-black">
      {/* Pull left to align with top nav, due to button padding */}
      <div className="-ml-2">
        <NodeHealth />
      </div>
    </footer>
  );
};

export const NodeHealth = () => {
  const { VEGA_URL } = useEnvironment();
  console.log('useGlobalStore', useGlobalStore);
  const setNodeSwitcher = useGlobalStore(
    (store) => (open: boolean) => store.update({ nodeSwitcherDialog: open })
  );

  console.log('setNodeSwitcher', setNodeSwitcher);

  const { datanodeBlockHeight, text, intent } = useNodeHealth();

  const onClick = useCallback(() => {
    setNodeSwitcher(true);
  }, [setNodeSwitcher]);
  console.log('VEGA_URL', VEGA_URL);
  return VEGA_URL ? (
    <FooterButton onClick={onClick} data-testid="node-health">
      <FooterButtonPart>
        <HealthIndicator text={text} intent={intent} />
      </FooterButtonPart>
      <FooterButtonPart>
        <NodeUrl url={VEGA_URL} />
      </FooterButtonPart>
      <FooterButtonPart>
        <span title={t('Block height')}>{datanodeBlockHeight}</span>
      </FooterButtonPart>
    </FooterButton>
  ) : null;
};

interface NodeUrlProps {
  url: string;
}

export const NodeUrl = ({ url }: NodeUrlProps) => {
  // get base url from api url, api sub domain
  const urlObj = new URL(url);
  const nodeUrl = urlObj.origin.replace(/^[^.]+\./g, '');
  return <span title={t('Connected node')}>{nodeUrl}</span>;
};

interface HealthIndicatorProps {
  text: string;
  intent: Intent;
}

// How many blocks behind the most advanced block that is
// deemed acceptable for "Good" status
/*const BLOCK_THRESHOLD = 3;
const ERROR_LATENCY = 20000;
const WARNING_LATENCY = 10000;*/

export const HealthIndicator = ({ text, intent }: HealthIndicatorProps) => {
  /*const online = useNavigatorOnline();

  let intent = Intent.Success;
  let text = 'Operational';

  if (!online) {
    text = t('Offline');
    intent = Intent.Danger;
  } else if (blockDiff === null) {
    // Block height query failed and null was returned
    text = t('Non operational');
    intent = Intent.Danger;
  } else if (blockUpdateMsLatency > ERROR_LATENCY) {
    text = t('Erroneous latency ( >%s sec): %s sec', [
      (ERROR_LATENCY / 1000).toFixed(2),
      (blockUpdateMsLatency / 1000).toFixed(2),
    ]);
    intent = Intent.Danger;
  } else if (blockDiff >= BLOCK_THRESHOLD) {
    text = t(`${blockDiff} Blocks behind`);
    intent = Intent.Warning;
  } else if (blockUpdateMsLatency > WARNING_LATENCY) {
    text = t('Warning delay ( >%s sec): %s sec', [
      (WARNING_LATENCY / 1000).toFixed(2),
      (blockUpdateMsLatency / 1000).toFixed(2),
    ]);
    intent = Intent.Warning;
  }*/

  return (
    <span title={t('Node health')}>
      <Indicator variant={intent} />
      {text}
    </span>
  );
};

type FooterButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const FooterButton = (props: FooterButtonProps) => {
  const buttonClasses = classNames(
    'px-2 py-0.5 rounded-md',
    'enabled:hover:bg-vega-light-150',
    'dark:enabled:hover:bg-vega-dark-150'
  );
  return <button {...props} className={buttonClasses} />;
};

const FooterButtonPart = ({ children }: { children: ReactNode }) => {
  return (
    <span
      className={classNames(
        'relative inline-block mr-2 last:mr-0 pr-2 last:pr-0',
        'last:after:hidden',
        'after:content after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2',
        'after:h-3 after:w-1 after:border-r',
        'after:border-vega-light-300 dark:after:border-vega-dark-300'
      )}
    >
      {children}
    </span>
  );
};
