import { useMemo, useState } from 'react';
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

const CANONICAL_URL = 'https://vega.trading';

type UpgradeBannerProps = {
  showVersionChange: boolean;
};
export const UpgradeBanner = ({ showVersionChange }: UpgradeBannerProps) => {
  const [visible, setVisible] = useState(true);
  const { data } = useReleases(ReleasesFeed.FrontEnd);
  const { APP_VERSION, VEGA_ENV } = useEnvironment();
  /**
   * Filtering out the release candidates.
   */
  const latest = useMemo(() => {
    const valid =
      VEGA_ENV === Networks.MAINNET
        ? data?.filter((r) => !/-rc$/i.test(r.tagName))
        : data;

    return valid && valid.length > 0 ? valid[0] : undefined;
  }, [VEGA_ENV, data]);

  if (!visible || !latest || latest.tagName === APP_VERSION) return null;

  const versionChange = (
    <span>
      <span className="line-through text-vega-light-300 dark:text-vega-dark-300">
        {APP_VERSION}
      </span>{' '}
      <VegaIcon size={14} name={VegaIconNames.ARROW_RIGHT} />{' '}
      <span className="text-vega-orange-500 dark:text-vega-yellow-500">
        <ExternalLink href={latest.htmlUrl}>{latest.tagName}</ExternalLink>
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
          <button title={t('Copy %s', CANONICAL_URL)} className="text-white">
            <span className="sr-only">{t('Copy %s', CANONICAL_URL)}</span>
            <VegaIcon size={14} name={VegaIconNames.COPY} />
          </button>
        </CopyWithTooltip>{' '}
        {'to always see the latest version.'}
      </div>
    </NotificationBanner>
  );
};
