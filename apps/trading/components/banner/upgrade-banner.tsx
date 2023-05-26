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

  const CANONICAL_URL = VEGA_NETWORKS[VEGA_ENV] || 'https://console.vega.xyz';

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

  return (
    <NotificationBanner
      intent={Intent.Warning}
      onClose={() => {
        setVisible(false);
      }}
    >
      <div className="uppercase mb-1">
        <ExternalLink href={CANONICAL_URL}>
          {t('Upgrade to the latest version of Console')}
        </ExternalLink>
      </div>
      <div data-testid="bookmark-message">
        <a
          className="underline"
          href={newest.htmlUrl}
          rel="noreferrer nofollow noopener"
          target="_blank"
        >
          {t("View what's changed")}
        </a>{' '}
        {t(' or bookmark')}{' '}
        <a className="underline" href={CANONICAL_URL}>
          {t('console.vega.xyz')}
        </a>{' '}
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
