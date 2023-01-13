import { useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { ButtonLink, Indicator, Intent, Link } from '@vegaprotocol/ui-toolkit';

export const Footer = () => {
  const { VEGA_URL, setNodeSwitcherOpen } = useEnvironment();
  return (
    <footer className="px-4 py-1 text-xs border-t border-default">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <NodeHealth />
          {VEGA_URL && <NodeUrl url={VEGA_URL} />}
          <ButtonLink onClick={setNodeSwitcherOpen}>{t('Change')}</ButtonLink>
        </div>
      </div>
    </footer>
  );
};

const NodeUrl = ({ url }: { url: string }) => {
  // get base url from api url, api sub domain
  const urlObj = new URL(url);
  const nodeUrl = urlObj.origin.replace(/^[^.]+\./g, '');
  return (
    <Link href={'https://' + nodeUrl} target="_blank">
      {nodeUrl}
    </Link>
  );
};

const NodeHealth = () => {
  const { nodeHealth } = useEnvironment();

  let intent = Intent.Success;
  if (nodeHealth === 'Critical') {
    intent = Intent.Danger;
  } else if (nodeHealth === 'Bad') {
    intent = Intent.Warning;
  }

  return <Indicator variant={intent} />;
};
