import { AppProps } from 'next/app';
import Head from 'next/head';
//import './styles.css';
import 'tailwindcss/tailwind.css';
import { Navbar } from '../components/navbar';

function VegaTradingApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to trading!</title>
      </Head>
      <Navbar />
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default VegaTradingApp;
