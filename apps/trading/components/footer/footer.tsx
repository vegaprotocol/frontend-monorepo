import { useEnvironment, useNodeHealth } from '@vegaprotocol/environment';
import { t, useNavigatorOnline } from '@vegaprotocol/react-helpers';
import { ButtonLink, Indicator, Intent } from '@vegaprotocol/ui-toolkit';
import { useGlobalStore } from '../../stores';

export const Footer = () => {
  const { VEGA_URL } = useEnvironment();
  const setNodeSwitcher = useGlobalStore(
    (store) => (open: boolean) => store.update({ nodeSwitcherDialog: open })
  );
  const { blockDiff } = useNodeHealth();

  return (
    <footer className="px-4 py-1 text-xs border-t border-default">
      <div className="flex justify-between">
        <div className="flex gap-2">
          {VEGA_URL && (
            <>
              <NodeHealth
                blockDiff={blockDiff}
                openNodeSwitcher={() => setNodeSwitcher(true)}
              />
              {' | '}
              <NodeUrl
                url={VEGA_URL}
                openNodeSwitcher={() => setNodeSwitcher(true)}
              />
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

export const NodeUrl = ({ url, openNodeSwitcher }: NodeUrlProps) => {
  // get base url from api url, api sub domain
  const urlObj = new URL(url);
  const nodeUrl = urlObj.origin.replace(/^[^.]+\./g, '');
  return <ButtonLink onClick={openNodeSwitcher}>{nodeUrl}</ButtonLink>;
};

interface NodeHealthProps {
  openNodeSwitcher: () => void;
  blockDiff: number | null;
}

// How many blocks behind the most advanced block that is
// deemed acceptable for "Good" status
const BLOCK_THRESHOLD = 3;

export const NodeHealth = ({
  blockDiff,
  openNodeSwitcher,
}: NodeHealthProps) => {
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
    <>
      <Indicator variant={intent} />
      <ButtonLink onClick={openNodeSwitcher}>{text}</ButtonLink>
    </>
  );
};
