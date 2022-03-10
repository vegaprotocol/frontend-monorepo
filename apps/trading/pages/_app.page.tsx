import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useCallback, useMemo } from 'react';
import { Navbar } from '../components/navbar';
import { createClient } from '../lib/apollo-client';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import './styles.css';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  const client = useMemo(() => createClient(process.env['NX_VEGA_URL']), []);
  useCallback(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  const setTheme = () => {
    localStorage.theme = document.documentElement.classList.toggle('dark')
      ? 'dark'
      : undefined;
  };
  return (
    <ApolloProvider client={client}>
      <Head>
        <title>Welcome to trading!</title>
        <link
          rel="icon"
          href="https://vega.xyz/favicon-32x32.png"
          type="image/png"
        />
      </Head>
      <div className="h-full dark:bg-black dark:text-white-60 bg-white text-black-60">
        <div className="flex items-center border-b-[7px] border-vega-yellow">
          <Navbar />
          <ThemeSwitcher onToggle={setTheme} className="ml-auto mr-8 -my-2" />
        </div>
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </ApolloProvider>
  );
}

export default VegaTradingApp;
