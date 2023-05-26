import { useCallback } from 'react';
import {
  useEnvironment,
  useNodeHealth,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import type { Intent } from '@vegaprotocol/ui-toolkit';
import { Indicator, ExternalLink } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

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
  const { VEGA_URL, VEGA_INCIDENT_URL } = useEnvironment();
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  const { datanodeBlockHeight, text, intent } = useNodeHealth();
  const onClick = useCallback(() => {
    setNodeSwitcher(true);
  }, [setNodeSwitcher]);
  const incidentsLink = VEGA_INCIDENT_URL && (
    <ExternalLink className="ml-1" href={VEGA_INCIDENT_URL}>
      {t('Mainnet status & incidents')}
    </ExternalLink>
  );
  return (
    <>
      {VEGA_URL && (
        <FooterButton onClick={onClick} data-testid="node-health">
          <FooterButtonPart>
            <HealthIndicator text={text} intent={intent} />
          </FooterButtonPart>
          <FooterButtonPart>
            <NodeUrl url={VEGA_URL} />
          </FooterButtonPart>
          {/* create a monospace effect - avoiding jumps of width */}
          <FooterButtonPart
            width={`${
              datanodeBlockHeight
                ? String(datanodeBlockHeight).length + 'ch'
                : 'auto'
            }`}
          >
            <span title={t('Block height')}>{datanodeBlockHeight}</span>
          </FooterButtonPart>
        </FooterButton>
      )}
      {incidentsLink}
    </>
  );
};

interface NodeUrlProps {
  url: string;
}

export const NodeUrl = ({ url }: NodeUrlProps) => {
  const urlObj = new URL(url);
  const nodeUrl = urlObj.hostname;
  return <span title={t('Connected node')}>{nodeUrl}</span>;
};

interface HealthIndicatorProps {
  text: string;
  intent: Intent;
}

export const HealthIndicator = ({ text, intent }: HealthIndicatorProps) => {
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

const FooterButtonPart = ({
  width = 'auto',
  children,
}: {
  children: ReactNode;
  width?: string;
}) => {
  return (
    <span
      style={{ width }}
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
