import {
  useEnvironment,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { Link } from '@vegaprotocol/ui-toolkit';
import { Routes } from '../../routes/route-names';
import { Link as RouteLink } from 'react-router-dom';

export const Footer = () => {
  const { API_NODE, GIT_COMMIT_HASH, GIT_ORIGIN_URL } = useEnvironment();
  const setNodeSwitcherOpen = useNodeSwitcherStore(
    (store) => store.setDialogOpen
  );

  return (
    <footer className="grid grid-cols-[1fr_auto] items-center text-xs md:text-md lg:flex md:col-span-2 px-4 pt-2 pb-3 gap-4 border-t border-gs-300 dark:border-gs-700 ">
      <div className="flex justify-between gap-2 align-middle">
        {GIT_COMMIT_HASH && (
          <div className="content-center flex border-r border-gs-300 dark:border-gs-700 pr-4">
            <p data-testid="git-commit-hash">
              {t('Version')}:{' '}
              <Link
                href={
                  GIT_ORIGIN_URL
                    ? `${GIT_ORIGIN_URL}/commit/${GIT_COMMIT_HASH}`
                    : undefined
                }
                target={GIT_ORIGIN_URL ? '_blank' : undefined}
              >
                {GIT_COMMIT_HASH}
              </Link>
            </p>
          </div>
        )}
        <div className="content-center flex pr-4 md:border-r border-gs-300 dark:border-gs-700">
          <span className="pr-2">
            {API_NODE?.graphQLApiUrl && (
              <NodeUrl url={API_NODE?.graphQLApiUrl} />
            )}
          </span>
          <Link
            className="ml-2 underline-offset-4"
            onClick={() => setNodeSwitcherOpen(true)}
          >
            {t('Change')}
          </Link>
        </div>
      </div>
      <div className="pl-2 align-center lg:align-right lg:flex lg:justify-end gap-2 align-middle lg:max-w-xs lg:ml-auto">
        <RouteLink
          to={`/${Routes.DISCLAIMER}`}
          className="underline underline-offset-4"
        >
          Disclaimer
        </RouteLink>
      </div>
    </footer>
  );
};

export const NodeUrl = ({ url }: { url: string }) => {
  // get base url from api url, api sub domain
  const urlObj = new URL(url);
  const nodeUrl = urlObj.origin.replace(/^[^.]+\./g, '');
  return <span className="cursor-default">{nodeUrl}</span>;
};
