import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { t } from '@vegaprotocol/i18n';
import { useEnvironment } from '../../hooks/use-environment';
import {
  NetworkSwitcher,
  envNameMapping,
  envTriggerMapping,
  envDescriptionMapping,
} from './';
import { Networks } from '../../';

jest.mock('../../hooks/use-environment');

describe('Network switcher', () => {
  it.each`
    network             | label
    ${Networks.CUSTOM}  | ${envTriggerMapping[Networks.CUSTOM]}
    ${Networks.DEVNET}  | ${envTriggerMapping[Networks.DEVNET]}
    ${Networks.TESTNET} | ${envTriggerMapping[Networks.TESTNET]}
    ${Networks.MAINNET} | ${envTriggerMapping[Networks.MAINNET]}
  `(
    'displays the correct selection label for $network',
    ({ network, label }) => {
      // @ts-ignore Typescript doesn't know about this module being mocked
      useEnvironment.mockImplementation(() => ({
        VEGA_ENV: network,
        VEGA_NETWORKS: {},
      }));

      render(<NetworkSwitcher />);

      expect(screen.getByRole('button')).toHaveTextContent(label);
    }
  );

  it('displays mainnet and testnet on the default dropdown view', async () => {
    const mainnetUrl = 'https://main.net';
    const testnetUrl = 'https://test.net';
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: Networks.DEVNET,
      VEGA_NETWORKS: {
        [Networks.MAINNET]: mainnetUrl,
        [Networks.TESTNET]: testnetUrl,
      },
    }));

    render(<NetworkSwitcher />);

    await userEvent.click(screen.getByRole('button'));

    const menuitems = screen.getAllByRole('menuitem');

    expect(menuitems[0]).toHaveTextContent(envNameMapping[Networks.MAINNET]);
    expect(menuitems[1]).toHaveTextContent(envNameMapping[Networks.TESTNET]);
    expect(menuitems[0]).not.toHaveTextContent(t('current'));
    expect(menuitems[1]).not.toHaveTextContent(t('current'));
    expect(menuitems[0]).not.toHaveTextContent(t('not available'));
    expect(menuitems[1]).not.toHaveTextContent(t('not available'));
    expect(menuitems[2]).toHaveTextContent(t('Advanced'));

    const links = screen.getAllByRole('link');

    expect(links[0]).toHaveAttribute('href', mainnetUrl);
    expect(links[1]).toHaveAttribute('href', testnetUrl);
  });

  it('displays the correct selected network on the default dropdown view', async () => {
    const mainnetUrl = 'https://main.net';
    const testnetUrl = 'https://test.net';
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: Networks.MAINNET,
      VEGA_NETWORKS: {
        [Networks.MAINNET]: mainnetUrl,
        [Networks.TESTNET]: testnetUrl,
      },
    }));

    render(<NetworkSwitcher />);

    await userEvent.click(screen.getByRole('button'));

    const menuitems = screen.getAllByRole('menuitem');

    expect(menuitems[0]).toHaveTextContent(envNameMapping[Networks.MAINNET]);
    expect(menuitems[0]).toHaveTextContent(t('current'));
  });

  it('displays the correct selected network on the default dropdown view when it does not have an associated url', async () => {
    const testnetUrl = 'https://test.net';
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: Networks.MAINNET,
      VEGA_NETWORKS: {
        [Networks.MAINNET]: undefined,
        [Networks.TESTNET]: testnetUrl,
      },
    }));

    render(<NetworkSwitcher />);

    await userEvent.click(screen.getByRole('button'));

    const menuitems = screen.getAllByRole('menuitem');

    expect(menuitems[0]).toHaveTextContent(envNameMapping[Networks.MAINNET]);
    expect(menuitems[0]).toHaveTextContent(t('current'));
  });

  it('displays the correct state for a network without url on the default dropdown view', async () => {
    const testnetUrl = 'https://test.net';
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: Networks.TESTNET,
      VEGA_NETWORKS: {
        [Networks.MAINNET]: undefined,
        [Networks.TESTNET]: testnetUrl,
      },
    }));

    render(<NetworkSwitcher />);

    await userEvent.click(screen.getByRole('button'));

    const menuitems = screen.getAllByRole('menuitem');

    expect(menuitems[0]).toHaveTextContent(envNameMapping[Networks.MAINNET]);
    expect(menuitems[0]).toHaveTextContent(t('not available'));
  });

  it('displays the advanced view in the correct state', async () => {
    const VEGA_NETWORKS: Record<Networks, string | undefined> = {
      [Networks.CUSTOM]: undefined,
      [Networks.MAINNET]: 'https://main.net',
      [Networks.TESTNET]: 'https://test.net',
      [Networks.VALIDATOR_TESTNET]: 'https://validator-test.net',
      [Networks.DEVNET]: 'https://dev.net',
      [Networks.STAGNET1]: 'https://stag1.net',
    };
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: Networks.DEVNET,
      VEGA_NETWORKS,
    }));

    render(<NetworkSwitcher />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(
      screen.getByRole('menuitem', { name: t('Advanced') })
    );

    [Networks.MAINNET, Networks.TESTNET, Networks.DEVNET].forEach((network) => {
      expect(
        screen.getByRole('link', {
          name: new RegExp(`^${envNameMapping[network]}`),
        })
      ).toHaveAttribute('href', VEGA_NETWORKS[network]);
      expect(
        screen.getByText(envDescriptionMapping[network])
      ).toBeInTheDocument();
    });
  });

  it('labels the selected network in the advanced view', async () => {
    const selectedNetwork = Networks.DEVNET;
    const VEGA_NETWORKS: Record<Networks, string | undefined> = {
      [Networks.CUSTOM]: undefined,
      [Networks.MAINNET]: 'https://main.net',
      [Networks.VALIDATOR_TESTNET]: 'https://validator-test.net',
      [Networks.TESTNET]: 'https://test.net',
      [Networks.DEVNET]: 'https://dev.net',
      [Networks.STAGNET1]: 'https://stag1.net',
    };
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: selectedNetwork,
      VEGA_NETWORKS,
    }));

    render(<NetworkSwitcher />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(
      screen.getByRole('menuitem', { name: t('Advanced') })
    );

    const label = screen.getByText(`(${t('current')})`);

    expect(label).toBeInTheDocument();
    expect(label.parentNode?.parentNode?.firstElementChild).toHaveTextContent(
      envNameMapping[selectedNetwork]
    );
  });

  it('labels unavailable networks view in the correct state', async () => {
    const selectedNetwork = Networks.DEVNET;
    const VEGA_NETWORKS: Record<Networks, string | undefined> = {
      [Networks.CUSTOM]: undefined,
      [Networks.MAINNET]: undefined,
      [Networks.VALIDATOR_TESTNET]: 'https://validator-test.net',
      [Networks.TESTNET]: 'https://test.net',
      [Networks.DEVNET]: 'https://dev.net',
      [Networks.STAGNET1]: 'https://stag1.net',
    };
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: selectedNetwork,
      VEGA_NETWORKS,
    }));

    render(<NetworkSwitcher />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Advanced'));

    const label = screen.getByText('(not available)');

    expect(label).toBeInTheDocument();
    expect(label.parentNode?.parentNode?.firstElementChild).toHaveTextContent(
      envNameMapping[Networks.MAINNET]
    );
  });
});
