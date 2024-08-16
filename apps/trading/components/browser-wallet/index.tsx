import dynamic from 'next/dynamic';

export const BrowserWallet = dynamic(
  () => import('@vegaprotocol/browser-wallet'),
  {
    ssr: false,
  }
);
