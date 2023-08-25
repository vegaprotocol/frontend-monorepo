import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import { useEnvironment } from '@vegaprotocol/environment';
import { AnnouncementBanner } from '@vegaprotocol/announcements';
import {
  BackgroundVideo,
  BreadcrumbsContainer,
  ButtonLink,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import {
  isRouteErrorResponse,
  Link,
  Outlet,
  useMatch,
  useRouteError,
} from 'react-router-dom';
import { Footer } from '../components/footer/footer';
import { Header } from '../components/header';
import { Routes } from './route-names';
import { useExplorerNodeNamesLazyQuery } from './validators/__generated__/NodeNames';
import {
  ProtocolUpgradeCountdownMode,
  ProtocolUpgradeInProgressNotification,
  ProtocolUpgradeProposalNotification,
} from '@vegaprotocol/proposals';

const DialogsContainer = () => {
  const { isOpen, id, trigger, asJson, setOpen } = useAssetDetailsDialogStore();
  return (
    <AssetDetailsDialog
      assetId={id}
      trigger={trigger || null}
      asJson={asJson}
      open={isOpen}
      onChange={setOpen}
    />
  );
};

export const Layout = () => {
  const isHome = Boolean(useMatch(Routes.HOME));
  const { ANNOUNCEMENTS_CONFIG_URL } = useEnvironment();
  const fixedWidthClasses = 'w-full max-w-[1500px] mx-auto';
  useExplorerNodeNamesLazyQuery();

  return (
    <>
      <div
        className={classNames(
          'min-h-screen',
          'mx-auto my-0',
          'grid grid-rows-[auto_1fr_auto] grid-cols-1',
          'border-vega-light-200 dark:border-vega-dark-200',
          'antialiased text-black dark:text-white',
          'relative'
        )}
      >
        <div>
          {ANNOUNCEMENTS_CONFIG_URL && (
            <AnnouncementBanner
              app="explorer"
              configUrl={ANNOUNCEMENTS_CONFIG_URL}
            />
          )}
          <Header />
          <ProtocolUpgradeProposalNotification
            mode={ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING}
          />
          <ProtocolUpgradeInProgressNotification />
        </div>
        <div className={fixedWidthClasses}>
          <main className="p-4">
            {!isHome && <BreadcrumbsContainer className="mb-4" />}
            <Outlet />
          </main>
        </div>
        <div className={fixedWidthClasses}>
          <Footer />
        </div>
      </div>
      <DialogsContainer />
    </>
  );
};

export const ErrorBoundary = () => {
  const error = useRouteError();

  const errorTitle = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : t('Something went wrong');

  const errorMessage = isRouteErrorResponse(error)
    ? error.error?.message
    : (error as Error).message || JSON.stringify(error);

  return (
    <>
      <BackgroundVideo className="brightness-50" />
      <div
        className={classNames(
          'max-w-[620px] p-2 mt-[10vh]',
          'mx-auto my-0',
          'antialiased text-white',
          'overflow-hidden relative',
          'flex flex-col gap-2'
        )}
      >
        <div className="flex gap-4">
          <div>{GHOST}</div>
          <h1 className="text-[2.7rem] font-alpha calt break-words uppercase">
            {errorTitle}
          </h1>
        </div>
        <div className="text-sm mt-10 overflow-auto break-all font-mono">
          {errorMessage}
        </div>
        <div>
          <ButtonLink onClick={() => window.location.reload()}>
            {t('Try refreshing')}
          </ButtonLink>{' '}
          {t('or go back to')}{' '}
          <Link className="underline" to="/">
            {t('Home')}
          </Link>
        </div>
      </div>
    </>
  );
};

const GHOST = (
  <svg
    width="56"
    height="85"
    viewBox="0 0 56 85"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M41 0.5H3V60.5H41V0.5Z" fill="white" />
    <path d="M15 18.5H13V20.5H15V18.5Z" fill="black" />
    <path d="M17 20.5H15V22.5H17V20.5Z" fill="black" />
    <path d="M19 18.5H17V20.5H19V18.5Z" fill="black" />
    <path d="M15 22.5H13V24.5H15V22.5Z" fill="black" />
    <path d="M19 22.5H17V24.5H19V22.5Z" fill="black" />
    <path d="M29 28.5H15V30.5H29V28.5Z" fill="black" />
    <path d="M27 18.5H25V20.5H27V18.5Z" fill="black" />
    <path d="M29 20.5H27V22.5H29V20.5Z" fill="black" />
    <path d="M31 18.5H29V20.5H31V18.5Z" fill="black" />
    <path d="M27 22.5H25V24.5H27V22.5Z" fill="black" />
    <path d="M31 22.5H29V24.5H31V22.5Z" fill="black" />
    <path d="M31 26.5H29V28.5H31V26.5Z" fill="black" />
    <path d="M19 60.5H17V84.5H19V60.5Z" fill="black" />
    <path d="M27 60.5H25V84.5H27V60.5Z" fill="black" />
    <path
      d="M3 42.5V58.64V60.5V64.5H21V60.5H23V64.5H41V60.5V58.64V42.5H3Z"
      fill="#FF077F"
    />
    <path d="M35 46.5H41V42.5H3V46.5H31H35Z" fill="#CB0666" />
    <path d="M3 32.32V29.5L0 32.5V60.5H2V33.33L3 32.32Z" fill="black" />
    <path d="M41 31.8V29.49L54.79 21.53L55.79 23.26L41 31.8Z" fill="black" />
    <path d="M36 54.5H35V55.5H36V54.5Z" fill="black" />
    <path d="M35 53.5H34V54.5H35V53.5Z" fill="black" />
    <path d="M34 48.5H33V53.5H34V48.5Z" fill="black" />
    <path d="M38 48.5H37V52.5H38V48.5Z" fill="black" />
    <path d="M37 53.5H36V54.5H37V53.5Z" fill="black" />
    <path d="M39 52.5H38V53.5H39V52.5Z" fill="black" />
    <path
      d="M55.7901 23.27L53.0601 22.54L45.1001 8.75L46.8301 7.75L55.7901 23.27Z"
      fill="black"
    />
  </svg>
);
