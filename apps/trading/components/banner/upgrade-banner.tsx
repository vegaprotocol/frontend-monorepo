import { useMemo, useState } from 'react';
import { gt, prerelease } from 'semver';
import {
  ReleasesFeed,
  useEnvironment,
  useReleases,
  Networks,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import {
  CopyWithTooltip,
  ExternalLink,
  Intent,
  NotificationBanner,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

// v0.20.12-core-0.71.4 -> v0.20.12
// we need to strip the "core" suffix in order to determine whether a release
// is a pre-release (candidate); example: v.0.21.0-beta.1-core-0.71.4
const parseTagName = (tagName: string) => tagName.replace(/-core-[\d.]+$/i, '');

type UpgradeBannerProps = {
  showVersionChange: boolean;
};
export const UpgradeBanner = ({ showVersionChange }: UpgradeBannerProps) => {
  const [visible, setVisible] = useState(true);
  const { data } = useReleases(ReleasesFeed.FrontEnd);
  const { APP_VERSION, VEGA_ENV, VEGA_NETWORKS } = useEnvironment();

  const CANONICAL_URL = VEGA_NETWORKS[VEGA_ENV] || 'https://vega.trading';

  const newest = useMemo(() => {
    if (!APP_VERSION || !data) return undefined;
    const newer = data.filter((r) => gt(r.tagName, APP_VERSION));
    const valid =
      // filter pre-releases on mainnet
      VEGA_ENV === Networks.MAINNET
        ? newer?.filter((r) => !prerelease(parseTagName(r.tagName)))
        : newer;
    return valid.sort((a, b) => (gt(a.tagName, b.tagName) ? -1 : 1))[0];
  }, [APP_VERSION, VEGA_ENV, data]);

  if (!visible || !newest) {
    return null;
  }

  const versionChange = (
    <span>
      <span className="line-through text-vega-light-300 dark:text-vega-dark-300">
        {APP_VERSION}
      </span>{' '}
      <VegaIcon size={14} name={VegaIconNames.ARROW_RIGHT} />{' '}
      <span className="text-vega-orange-500 dark:text-vega-yellow-500">
        <ExternalLink href={newest.htmlUrl}>{newest.tagName}</ExternalLink>
      </span>
    </span>
  );

  return (
    <NotificationBanner
      intent={Intent.Warning}
      onClose={() => {
        setVisible(false);
      }}
    >
      <div className="uppercase ">
        {t('Upgrade to the latest version of Console')}{' '}
        {showVersionChange && versionChange}
      </div>
      <div data-testid="bookmark-message">
        {t('Bookmark')}{' '}
        <ExternalLink href={CANONICAL_URL}>{t('vega.trading')}</ExternalLink>
        <CopyWithTooltip text={CANONICAL_URL}>
          <button title={t('Copy %s', CANONICAL_URL)}>
            <span className="sr-only">{t('Copy %s', CANONICAL_URL)}</span>
            <VegaIcon size={14} name={VegaIconNames.COPY} />
          </button>
        </CopyWithTooltip>{' '}
        {'to always see the latest version.'}
      </div>
    </NotificationBanner>
  );
};
