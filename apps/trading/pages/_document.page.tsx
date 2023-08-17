import { Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <body className="bg-white dark:bg-vega-cdark-900 text-default font-alpha">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
