import {
  useEnvironment,
  useNodeHealth,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import {
  Indicator,
  ExternalLink,
  Tooltip,
  Intent,
} from '@vegaprotocol/ui-toolkit';

export const NodeHealthContainer = () => {
  const { VEGA_URL, VEGA_INCIDENT_URL } = useEnvironment();
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  const { datanodeBlockHeight, text, intent } = useNodeHealth();
  console.log(intent);

  return (
    <Tooltip
      description={
        <div className="flex flex-col gap-2 p-1 text-base">
          <p>Status: {text}</p>
          {VEGA_URL && (
            <p>
              Node: <NodeUrl url={VEGA_URL} />
            </p>
          )}
          <p>Block height: {datanodeBlockHeight}</p>
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
        className="flex justify-center items-center py-3 rounded hover:bg-vega-light-200 hover:dark:bg-vega-dark-200"
        onClick={() => setNodeSwitcher(true)}
      >
        <Indicator variant={Intent.Danger} size="lg" />
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
