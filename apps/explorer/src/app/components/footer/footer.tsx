import { useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Link, Lozenge } from '@vegaprotocol/ui-toolkit';
import { useEnvironment, NetworkSwitcherDialog } from '@vegaprotocol/environment';

const gitCommitHash = process.env['GIT_COMMIT_HASH'];
const gitOriginUrl = process.env['NX_GIT_ORIGIN_URL'] || process.env['GIT_ORIGIN_URL'];
const noltUrl = process.env['NX_NOLT_URL'];

console.log(gitCommitHash)

const feedbackLinks = [
  {
    name: 'Nolt',
    url: noltUrl,
  },
  {
    name: 'Github',
    url: gitOriginUrl ? `${gitOriginUrl}/issues` : undefined,
  }
].filter(link => !!link.url);

console.log(feedbackLinks)

export const Footer = () => {
  const [isNetworkConfigOpen, setNetworkConfigOpen] = useState(false);
  const { VEGA_URL, VEGA_NETWORKS } = useEnvironment();

  return (
    <>
      <footer className="grid grid-rows-2 grid-cols-[1fr_auto] md:flex md:col-span-2 p-16 gap-12 border-t-1">
        <div>
          {gitCommitHash && <p className="mb-[1rem]">{t('Version/commit hash')}: <Link href={`${gitOriginUrl}/commit/${gitCommitHash}`} target="_blank">{gitCommitHash}</Link></p>}
          <p className="mb-[1rem]">{t('This site is reading data from')} <Lozenge className="bg-white-80 dark:bg-black-80">{VEGA_URL}</Lozenge>. <Link onClick={() => setNetworkConfigOpen(true)}>{t('Edit')}</Link></p>
          {feedbackLinks.length > 0 && (
            <p className="mb-16">
              {t('Known issues and feedback on')}{' '}
              {feedbackLinks.map(({ name, url }, index) => (
                <>
                  <Link key={index} href={url}>{name}</Link>
                  {feedbackLinks.length > 1 && index < feedbackLinks.length - 2 && ','}
                  {feedbackLinks.length > 1 && index === feedbackLinks.length - 1 && `, ${t('and')} `}
                </>
              ))}
            </p>
          )}
        </div>
      </footer>
      <NetworkSwitcherDialog
        dialogOpen={isNetworkConfigOpen}
        setDialogOpen={setNetworkConfigOpen}
        onConnect={({ network }) => {
          if (VEGA_NETWORKS[network]) {
            window.location.href = VEGA_NETWORKS[network] as string;
          }
        }}
      />
    </>
  );
};
