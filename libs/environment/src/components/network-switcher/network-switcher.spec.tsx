import { render, screen, fireEvent } from '@testing-library/react';
import { t } from '@vegaprotocol/react-helpers';
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
    network              | label
    ${Networks.CUSTOM}   | ${envTriggerMapping[Networks.CUSTOM]}
    ${Networks.DEVNET}   | ${envTriggerMapping[Networks.DEVNET]}
    ${Networks.STAGNET}  | ${envTriggerMapping[Networks.STAGNET]}
    ${Networks.STAGNET2} | ${envTriggerMapping[Networks.STAGNET2]}
    ${Networks.STAGNET3} | ${envTriggerMapping[Networks.STAGNET3]}
    ${Networks.TESTNET}  | ${envTriggerMapping[Networks.TESTNET]}
    ${Networks.MAINNET}  | ${envTriggerMapping[Networks.MAINNET]}
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

  it('displays mainnet and testnet on the default dropdown view', () => {
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

    fireEvent.click(screen.getByRole('button'));

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

  it('displays the correct selected network on the default dropdown view', () => {
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

    fireEvent.click(screen.getByRole('button'));

    const menuitems = screen.getAllByRole('menuitem');

    expect(menuitems[0]).toHaveTextContent(envNameMapping[Networks.MAINNET]);
    expect(menuitems[0]).toHaveTextContent(t('current'));
  });

  it('displays the correct selected network on the default dropdown view when it does not have an associated url', () => {
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

    fireEvent.click(screen.getByRole('button'));

    const menuitems = screen.getAllByRole('menuitem');

    expect(menuitems[0]).toHaveTextContent(envNameMapping[Networks.MAINNET]);
    expect(menuitems[0]).toHaveTextContent(t('current'));
  });

  it('displays the correct state for a network without url on the default dropdown view', () => {
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

    fireEvent.click(screen.getByRole('button'));

    const menuitems = screen.getAllByRole('menuitem');

    expect(menuitems[0]).toHaveTextContent(envNameMapping[Networks.MAINNET]);
    expect(menuitems[0]).toHaveTextContent(t('not available'));
  });

  it('displays the advanced view in the correct state', () => {
    const VEGA_NETWORKS: Record<Networks, string | undefined> = {
      [Networks.CUSTOM]: undefined,
      [Networks.MAINNET]: 'https://main.net',
      [Networks.TESTNET]: 'https://test.net',
      [Networks.STAGNET3]: 'https://stag3.net',
      [Networks.STAGNET2]: 'https://stag2.net',
      [Networks.STAGNET]: 'https://stag.net',
      [Networks.DEVNET]: 'https://dev.net',
    };
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: Networks.DEVNET,
      VEGA_NETWORKS,
    }));

    render(<NetworkSwitcher />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('menuitem', { name: t('Advanced') }));

    [
      Networks.MAINNET,
      Networks.TESTNET,
      Networks.STAGNET3,
      Networks.STAGNET2,
      Networks.STAGNET,
      Networks.DEVNET,
    ].forEach((network) => {
      expect(
        screen.getByRole('link', { name: envNameMapping[network] })
      ).toHaveAttribute('href', VEGA_NETWORKS[network]);
      expect(
        screen.getByText(envDescriptionMapping[network])
      ).toBeInTheDocument();
    });
  });

  it('labels the selected network in the advanced view', () => {
    const selectedNetwork = Networks.DEVNET;
    const VEGA_NETWORKS: Record<Networks, string | undefined> = {
      [Networks.CUSTOM]: undefined,
      [Networks.MAINNET]: 'https://main.net',
      [Networks.TESTNET]: 'https://test.net',
      [Networks.STAGNET3]: 'https://stag3.net',
      [Networks.STAGNET2]: 'https://stag2.net',
      [Networks.STAGNET]: 'https://stag.net',
      [Networks.DEVNET]: 'https://dev.net',
    };
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: selectedNetwork,
      VEGA_NETWORKS,
    }));

    render(<NetworkSwitcher />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('menuitem', { name: t('Advanced') }));

    const label = screen.getByText(`(${t('current')})`);

    expect(label).toBeInTheDocument();
    expect(label.parentNode?.firstElementChild).toHaveTextContent(
      envNameMapping[selectedNetwork]
    );
  });

  it('labels unavailable networks view in the correct state', () => {
    const selectedNetwork = Networks.DEVNET;
    const VEGA_NETWORKS: Record<Networks, string | undefined> = {
      [Networks.CUSTOM]: undefined,
      [Networks.MAINNET]: undefined,
      [Networks.TESTNET]: 'https://test.net',
      [Networks.STAGNET3]: 'https://stag3.net',
      [Networks.STAGNET2]: 'https://stag2.net',
      [Networks.STAGNET]: 'https://stag.net',
      [Networks.DEVNET]: 'https://dev.net',
    };
    // @ts-ignore Typescript doesn't know about this module being mocked
    useEnvironment.mockImplementation(() => ({
      VEGA_ENV: selectedNetwork,
      VEGA_NETWORKS,
    }));

    render(<NetworkSwitcher />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('menuitem', { name: t('Advanced') }));

    const label = screen.getByText(`(${t('not available')})`);

    expect(label).toBeInTheDocument();
    expect(label.parentNode?.firstElementChild).toHaveTextContent(
      envNameMapping[Networks.MAINNET]
    );
  });
});
