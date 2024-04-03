type Browser = 'chrome' | 'firefox' | undefined;

export const useUserAgent = (): Browser => {
  const isItChrome = window.navigator.userAgent.includes('Chrome');
  const isItMozilla =
    window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  if (isItChrome) return 'chrome';
  if (isItMozilla) return 'firefox';

  return undefined;
};
