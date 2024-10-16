import {
  useEnvironment,
  useNodeHealth,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { Indicator, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { cn } from '@vegaprotocol/ui-toolkit';
import { useMatch } from 'react-router-dom';

export const NodeHealthContainer = ({
  variant: _variant,
}: {
  variant?: 'normal' | 'compact';
}) => {
  const { API_NODE } = useEnvironment();
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  const { text, intent, datanodeBlockHeight } = useNodeHealth();

  const tradePageMatch = useMatch('/markets/:marketId');
  const variant = _variant || tradePageMatch ? 'normal' : 'compact';

  return (
    <Tooltip
      description={
        <div
          className="flex flex-col gap-2 p-2 text-sm"
          data-testid="node-health"
        >
          <div className="flex items-center gap-2">
            <Indicator intent={intent} />
            <p>{text}</p>
            <p>{datanodeBlockHeight}</p>
          </div>
          {API_NODE && (
            <p>
              <NodeUrl url={API_NODE.graphQLApiUrl} />
            </p>
          )}
        </div>
      }
      align="end"
      side="left"
      sideOffset={5}
      alignOffset={0}
    >
      <button
        className={cn('flex justify-center items-center gap-2', {
          'h-4 p-1 rounded hover:bg-gs-300 hover:dark:bg-gs-700 text-xs':
            variant === 'normal',
          'flex w-4 h-4 p-1 rounded': variant === 'compact',
        })}
        onClick={() => setNodeSwitcher(true)}
        data-testid="node-health-trigger"
      >
        {variant === 'normal' && (
          <span>{API_NODE && <NodeUrl url={API_NODE.graphQLApiUrl} />}</span>
        )}

        <Indicator intent={intent} size="md" />
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
