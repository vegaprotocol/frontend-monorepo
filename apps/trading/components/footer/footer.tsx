import type { NodeHealth as NodeHealthType } from '@vegaprotocol/environment';
import { useEnvironment } from '@vegaprotocol/environment';
import { ButtonLink, Indicator, Intent } from '@vegaprotocol/ui-toolkit';

export const Footer = () => {
  const { VEGA_URL, nodeHealth, setNodeSwitcherOpen } = useEnvironment();
  return (
    <footer className="px-4 py-1 text-xs border-t border-default">
      <div className="flex justify-between">
        <div className="flex gap-2">
          {VEGA_URL && (
            <>
              <NodeHealth
                health={nodeHealth}
                openNodeSwitcher={setNodeSwitcherOpen}
              />
              {' | '}
              <NodeUrl url={VEGA_URL} openNodeSwitcher={setNodeSwitcherOpen} />
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

interface NodeUrlProps {
  url: string;
  openNodeSwitcher: () => void;
}

const NodeUrl = ({ url, openNodeSwitcher }: NodeUrlProps) => {
  // get base url from api url, api sub domain
  const urlObj = new URL(url);
  const nodeUrl = urlObj.origin.replace(/^[^.]+\./g, '');
  return <ButtonLink onClick={openNodeSwitcher}>{nodeUrl}</ButtonLink>;
};

interface NodeHealthProps {
  openNodeSwitcher: () => void;
  health: NodeHealthType;
}

export const NodeHealth = ({ health, openNodeSwitcher }: NodeHealthProps) => {
  let intent = Intent.Success;
  if (health === 'Critical') {
    intent = Intent.Danger;
  } else if (health === 'Bad') {
    intent = Intent.Warning;
  }

  return (
    <span>
      <Indicator variant={intent} />
      <ButtonLink onClick={openNodeSwitcher}>{health}</ButtonLink>
    </span>
  );
};
