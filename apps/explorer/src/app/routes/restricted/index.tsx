import { BackgroundVideo } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';

const RestrictedPage = () => {
  const errorTitle = '451 Unavailable';
  const errorMessage =
    'Due to uncertainty about the legal and regulatory status of the content hosted on this site, it is not available to visitors in your jurisdiction.';

  return (
    <div>
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
        <div className="text-sm mt-10 overflow-auto font-mono">
          {errorMessage}
        </div>
      </div>
    </div>
  );
};

const GHOST = (
  <svg
    width="56"
    height="85"
    viewBox="0 0 150 234"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.43 93.6821L0 104.097V172.435H5.13793V106.2L14.0779 97.3247L10.43 93.6821Z"
      fill="black"
    />
    <path d="M105.328 18.521H7.70703V172.435H105.328V18.521Z" fill="white" />
    <path d="M38.5364 64.6953H33.3984V69.8258H38.5364V64.6953Z" fill="black" />
    <path d="M43.6731 69.8257H38.5352V74.9561H43.6731V69.8257Z" fill="black" />
    <path d="M48.8098 74.9561H43.6719V80.0865H48.8098V74.9561Z" fill="black" />
    <path d="M38.5364 74.9561H33.3984V80.0865H38.5364V74.9561Z" fill="black" />
    <path d="M48.8098 64.6953H43.6719V69.8258H48.8098V64.6953Z" fill="black" />
    <path d="M69.3606 64.6953H64.2227V69.8258H69.3606V64.6953Z" fill="black" />
    <path d="M74.5012 69.8257H69.3633V74.9561H74.5012V69.8257Z" fill="black" />
    <path d="M79.6379 74.9561H74.5V80.0865H79.6379V74.9561Z" fill="black" />
    <path d="M69.3606 74.9561H64.2227V80.0865H69.3606V74.9561Z" fill="black" />
    <path d="M79.6379 64.6953H74.5V69.8258H79.6379V64.6953Z" fill="black" />
    <path d="M79.6398 90.3477H33.3984V95.4781H79.6398V90.3477Z" fill="black" />
    <path d="M48.8098 172.435H43.6719V234H48.8098V172.435Z" fill="black" />
    <path d="M69.3606 172.435H64.2227V234H69.3606V172.435Z" fill="black" />
    <path
      d="M129.87 0.00408026L92.0273 14.3682L111.195 64.7203L149.038 50.3562L129.87 0.00408026Z"
      fill="#FF0081"
    />
    <path
      d="M108.565 21.7836L103.762 23.6064L105.587 28.4024L110.39 26.5795L108.565 21.7836Z"
      fill="white"
    />
    <path
      d="M115.189 24.7596L110.387 26.583L112.213 31.3785L117.015 29.5551L115.189 24.7596Z"
      fill="white"
    />
    <path
      d="M121.826 27.7348L117.023 29.5576L118.849 34.3536L123.652 32.5307L121.826 27.7348Z"
      fill="white"
    />
    <path
      d="M128.447 30.7059L123.645 32.5293L125.471 37.3247L130.273 35.5014L128.447 30.7059Z"
      fill="white"
    />
    <path
      d="M135.084 33.6854L130.281 35.5083L132.107 40.3043L136.91 38.4814L135.084 33.6854Z"
      fill="white"
    />
    <path
      d="M124.799 21.1156L119.996 22.939L121.822 27.7344L126.625 25.911L124.799 21.1156Z"
      fill="white"
    />
    <path
      d="M127.775 14.492L122.973 16.3154L124.799 21.1109L129.601 19.2875L127.775 14.492Z"
      fill="white"
    />
    <path
      d="M118.838 34.3499L114.035 36.1733L115.861 40.9688L120.664 39.1454L118.838 34.3499Z"
      fill="white"
    />
    <path
      d="M115.857 40.9691L111.055 42.7925L112.881 47.5879L117.683 45.7645L115.857 40.9691Z"
      fill="white"
    />
    <path
      d="M129.938 52.3822L139.906 91.5276L100.703 101.429L101.988 106.406L146.174 95.2215L134.922 51.0996L129.938 52.3822Z"
      fill="black"
    />
  </svg>
);

export default RestrictedPage;
