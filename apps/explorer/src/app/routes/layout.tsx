import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import {
  AnnouncementBanner,
  BackgroundVideo,
  BreadcrumbsContainer,
  ButtonLink,
  ExternalLink,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { useState } from 'react';
import {
  isRouteErrorResponse,
  Link,
  Outlet,
  useRouteError,
} from 'react-router-dom';
import { Footer } from '../components/footer/footer';
import { Header } from '../components/header';

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

const MainnetSimAd = () => {
  const [shouldDisplayBanner, setShouldDisplayBanner] = useState<boolean>(true);

  // Return an empty div so that the grid layout in _app.page.ts
  // renders correctly
  if (!shouldDisplayBanner) {
    return <div />;
  }

  return (
    <AnnouncementBanner>
      <div className="grid grid-cols-[auto_1fr] gap-4 font-alpha calt uppercase text-center text-lg text-white">
        <button
          className="flex items-center"
          onClick={() => setShouldDisplayBanner(false)}
        >
          <Icon name="cross" className="w-6 h-6" ariaLabel="dismiss" />
        </button>
        <div>
          <span className="pr-4">Mainnet sim 3 is live!</span>
          <ExternalLink href="https://fairground.wtf/">Learn more</ExternalLink>
        </div>
      </div>
    </AnnouncementBanner>
  );
};

export const Layout = () => {
  return (
    <>
      <div
        className={classNames(
          'max-w-[1500px] min-h-[100vh]',
          'mx-auto my-0',
          'grid grid-rows-[auto_1fr_auto] grid-cols-1',
          'border-vega-light-200 dark:border-vega-dark-200 lg:border-l lg:border-r',
          'antialiased text-black dark:text-white',
          'overflow-hidden relative'
        )}
      >
        <div>
          <MainnetSimAd />
          <Header />
        </div>
        <div>
          <main className="p-4">
            <BreadcrumbsContainer className="mb-4" />
            <Outlet />
          </main>
        </div>
        <div>
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
          <h1 className="text-[3rem] font-alpha calt break-all uppercase">
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
