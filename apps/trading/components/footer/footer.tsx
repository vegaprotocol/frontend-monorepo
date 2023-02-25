import { useEnvironment, useNodeHealth } from '@vegaprotocol/environment';
import { t, useNavigatorOnline } from '@vegaprotocol/react-helpers';
import { Indicator, Intent } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ButtonHTMLAttributes } from 'react';
import { useGlobalStore } from '../../stores';

export const Footer = () => {
  const { VEGA_URL } = useEnvironment();
  const setNodeSwitcher = useGlobalStore(
    (store) => (open: boolean) => store.update({ nodeSwitcherDialog: open })
  );
  const { blockDiff, datanodeBlockHeight } = useNodeHealth();

  return (
    <footer className="px-4 py-1 text-xs border-t border-default text-vega-light-300 dark:text-vega-dark-300">
      {/* Pull left to align with top nav, due to button padding */}
      <div className="-ml-2">
        {VEGA_URL && (
          <NodeHealth
            url={VEGA_URL}
            blockHeight={datanodeBlockHeight}
            blockDiff={blockDiff}
            onClick={() => setNodeSwitcher(true)}
          />
        )}
      </div>
    </footer>
  );
};
interface NodeHealthProps {
  url: string;
  blockHeight: number | undefined;
  blockDiff: number | null;
  onClick: () => void;
}

export const NodeHealth = ({
  url,
  blockHeight,
  blockDiff,
  onClick,
}: NodeHealthProps) => {
  return (
    <FooterButton onClick={onClick}>
      <span className="mr-2 pr-2 border-r border-vega-light-300 dark:border-vega-dark-300">
        <HealthIndicator blockDiff={blockDiff} />
      </span>
      <span className="mr-2 pr-2 border-r border-vega-light-300 dark:border-vega-dark-300">
        <NodeUrl url={url} />
      </span>
      <span title={t('Block height')}>{blockHeight}</span>
    </FooterButton>
  );
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
  blockDiff: number | null;
}

// How many blocks behind the most advanced block that is
// deemed acceptable for "Good" status
const BLOCK_THRESHOLD = 3;

export const HealthIndicator = ({ blockDiff }: HealthIndicatorProps) => {
  const online = useNavigatorOnline();

  let intent = Intent.Success;
  let text = 'Operational';

  if (!online) {
    text = t('Offline');
    intent = Intent.Danger;
  } else if (blockDiff === null) {
    // Block height query failed and null was returned
    text = t('Non operational');
    intent = Intent.Danger;
  } else if (blockDiff >= BLOCK_THRESHOLD) {
    text = t(`${blockDiff} Blocks behind`);
    intent = Intent.Warning;
  }

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
