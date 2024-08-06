import { useEffect, useState } from 'react';

import { isIos } from '@/lib/is-ios';
import { useGlobalsStore } from '@/stores/globals';

import { Frame } from '../../frame';
import { Splash } from '../../splash';

export const locators = {
  orientationSplash: 'orientation-splash',
};

// Note: here we are not using screen as this was being reported incorrectly by firefox android.
// it was both reporting landscape when portrait and vice versa. As well as intermittently reporting the correct value.
const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    window.matchMedia('(orientation: portrait)').matches
      ? 'portrait'
      : 'landscape'
  );
  const updateOrientation = (event: MediaQueryListEvent) => {
    const portrait = event.matches;

    if (portrait) {
      setOrientation('portrait');
    } else {
      setOrientation('landscape');
    }
  };
  useEffect(() => {
    window
      .matchMedia('(orientation: portrait)')
      .addEventListener('change', updateOrientation);
    return () => {
      window
        .matchMedia('(orientation: portrait)')
        .removeEventListener('change', updateOrientation);
    };
  }, []);

  return orientation;
};

export const OrientationSplash = () => {
  const orientation = useOrientation();
  const isLandscape = orientation.includes('landscape');
  const isMobile = useGlobalsStore((state) => state.isMobile);
  const ios = isIos();
  if (isLandscape && isMobile && !ios) {
    return (
      <Splash data-testid={locators.orientationSplash} centered={true}>
        <div className="px-5">
          <Frame>
            <div className="text-center">
              <div className="flex justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.9422 3.05783L13.1352 3.2508L15 1.38595V6.82197H9.56398L12.2194 4.16659L12.0282 3.97362C10.9984 2.9343 9.58373 2.27356 7.99545 2.27356C4.83369 2.27356 2.26446 4.84279 2.26446 8.00456C2.26446 11.1663 4.83369 13.7356 7.99545 13.7356C10.4205 13.7356 12.4924 12.2265 13.3249 10.0968H14.6658C13.7757 12.9439 11.136 15.0091 7.99545 15.0091C4.12582 15.0091 1 11.8751 1 8.00456C1 4.13404 4.12582 1.00001 7.99545 1.00001C9.92977 1.00001 11.6716 1.78729 12.9422 3.05783Z"
                    fill="white"
                  />
                </svg>
              </div>
              <p className="my-4 text-lg">
                This app is only built for portrait. Please rotate your phone.
              </p>
            </div>
          </Frame>
        </div>
      </Splash>
    );
  }
  return null;
};
