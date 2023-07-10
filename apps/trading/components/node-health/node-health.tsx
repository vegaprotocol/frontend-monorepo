import {
  useEnvironment,
  useNodeHealth,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { Indicator, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Tooltip } from '../../components/tooltip';

export const NodeHealthContainer = () => {
  const { VEGA_URL, VEGA_INCIDENT_URL } = useEnvironment();
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  const { text, intent, datanodeBlockHeight } = useNodeHealth();

  return (
    <Tooltip
      description={
        <div
          className="flex flex-col gap-2 p-4 text-sm"
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
      side="right"
      sideOffset={10}
    >
      <button
        className="flex justify-center items-center p-2 rounded hover:bg-vega-light-200 hover:dark:bg-vega-dark-200"
        onClick={() => setNodeSwitcher(true)}
        data-testid="node-health-trigger"
      >
        <Indicator variant={intent} size="lg" />
      </button>
    </Tooltip>
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
