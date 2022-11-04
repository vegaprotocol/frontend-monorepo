import { enabledAssetsProvider } from '@vegaprotocol/assets';
import { DepositManager } from '@vegaprotocol/deposits';
import { useEnvironment } from '@vegaprotocol/environment';
import { t, titlefy, useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { Web3Container } from '@vegaprotocol/web3';
import { useEffect } from 'react';
import { usePageTitleStore } from '../../../stores';

const Deposit = () => {
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    updateTitle(titlefy([t('Deposits')]));
  }, [updateTitle]);

  const { VEGA_ENV } = useEnvironment();
  const { data, error, loading } = useDataProvider({
    dataProvider: enabledAssetsProvider,
  });

  return (
    <Web3Container>
      <div className="max-w-[420px] p-8 mx-auto">
        <h1 className="text-2xl mb-4">{t('Deposit')}</h1>
        <AsyncRenderer
          data={data}
          error={error}
          loading={loading}
          render={(assets) => {
            if (!assets || !assets.length) {
              return (
                <Splash>
                  <p>{t('No assets on this network')}</p>
                </Splash>
              );
            }

            return (
              <DepositManager
                assets={assets}
                isFaucetable={VEGA_ENV !== 'MAINNET'}
              />
            );
          }}
        />
      </div>
    </Web3Container>
  );
};

Deposit.getInitialProps = () => ({
  page: 'deposit',
});

export default Deposit;
