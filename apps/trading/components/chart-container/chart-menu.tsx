import { Trans } from 'react-i18next';

export const ChartMenu = () => {
  return (
    <p className="text-xs mr-2 whitespace-nowrap">
      <Trans
        i18nKey="Chart by <0>TradingView</0>"
        components={[
          // eslint-disable-next-line
          <a
            className="underline underline-offset-4"
            target="_blank"
            href="https://www.tradingview.com"
          />,
        ]}
      />
    </p>
  );
};
