import {
  useEnvironment,
  useNodeHealth,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { Indicator, ExternalLink, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import classNames from 'classnames';

export const NodeHealthContainer = ({
  variant = 'normal',
}: {
  variant?: 'compact' | 'normal';
}) => {
  const t = useT();
  const { VEGA_URL, VEGA_INCIDENT_URL } = useEnvironment();
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  const { text, intent, datanodeBlockHeight } = useNodeHealth();

  return (
    <Tooltip
      description={
        <div
          className="flex flex-col gap-2 p-2 text-sm"
          data-testid="node-health"
        >
          <div className="flex items-center gap-2">
            <Indicator variant={intent} />
            <p>{text}</p>
            <p>{datanodeBlockHeight}</p>
          </div>
          {VEGA_URL && (
            <p>
              <NodeUrl url={VEGA_URL} />
            </p>
          )}
          {VEGA_INCIDENT_URL && (
            <ExternalLink href={VEGA_INCIDENT_URL}>
              {t('Mainnet status & incidents')}
            </ExternalLink>
          )}
        </div>
      }
      align="end"
      side="left"
      sideOffset={5}
      alignOffset={0}
    >
      <button
        className={classNames({
          'flex justify-center items-center gap-2 py-1 p-2 rounded hover:bg-vega-light-200 hover:dark:bg-vega-dark-200 text-xs':
            variant === 'normal',
          'flex w-3 h-3': variant === 'compact',
        })}
        onClick={() => setNodeSwitcher(true)}
        data-testid="node-health-trigger"
      >
        {variant === 'normal' && (
          <span>{VEGA_URL && <NodeUrl url={VEGA_URL} />}</span>
        )}
        <Indicator
          variant={intent}
          size={variant === 'compact' ? 'lg' : 'md'}
        />
      </button>
    </Tooltip>
  );
};

interface NodeUrlProps {
  url: string;
}

export const NodeUrl = ({ url }: NodeUrlProps) => {
  const t = useT();
  const urlObj = new URL(url);
  const nodeUrl = urlObj.hostname;
  return <span title={t('Connected node')}>{nodeUrl}</span>;
};
