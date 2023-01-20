import { useEnvironment } from '@vegaprotocol/environment';
import { ButtonLink, Indicator, Intent } from '@vegaprotocol/ui-toolkit';

export const Footer = () => {
  const { VEGA_URL, setNodeSwitcherOpen } = useEnvironment();
  return (
    <footer className="px-4 py-1 text-xs border-t border-default">
      <div className="flex justify-between">
        <div className="flex gap-2">
          {VEGA_URL && (
            <>
              <NodeHealth openNodeSwitcher={setNodeSwitcherOpen} />
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
}

const NodeHealth = ({ openNodeSwitcher }: NodeHealthProps) => {
  const { nodeHealth } = useEnvironment();

  let intent = Intent.Success;
  if (nodeHealth === 'Critical') {
    intent = Intent.Danger;
  } else if (nodeHealth === 'Bad') {
    intent = Intent.Warning;
  }

  return (
    <span>
      <Indicator variant={intent} />
      <ButtonLink onClick={openNodeSwitcher}>{nodeHealth}</ButtonLink>
    </span>
  );
};
