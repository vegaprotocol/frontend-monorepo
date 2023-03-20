import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodeHealth, NodeUrl, HealthIndicator } from './footer';
import { MockedProvider } from '@apollo/client/testing';
import { Intent } from '@vegaprotocol/ui-toolkit';

jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  useEnvironment: jest
    .fn()
    .mockImplementation(() => ({ VEGA_URL: 'https://vega-url.wtf' })),
}));

const mockSetNodeSwitcher = jest.fn();
jest.mock('../../stores', () => ({
  ...jest.requireActual('../../stores'),
  useGlobalStore: () => mockSetNodeSwitcher,
}));

describe('NodeHealth', () => {
  it('controls the node switcher dialog', async () => {
    render(<NodeHealth />, { wrapper: MockedProvider });
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button'));
    expect(mockSetNodeSwitcher).toHaveBeenCalled();
  });
});

describe('NodeUrl', () => {
  it('renders correct part of node url', () => {
    const node = 'https://api.n99.somenetwork.vega.xyz';
    const expectedText = node.split('.').slice(1).join('.');

    render(<NodeUrl url={node} />);

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});

describe('HealthIndicator', () => {
  const cases = [
    {
      intent: Intent.Success,
      text: 'Operational',
      classname: 'bg-vega-green-550',
    },
    {
      intent: Intent.Warning,
      text: '5 Blocks behind',
      classname: 'bg-warning',
    },
    { intent: Intent.Danger, text: 'Non operational', classname: 'bg-danger' },
  ];
  it.each(cases)(
    'renders correct text and indicator color for $diff block difference',
    (elem) => {
      render(<HealthIndicator text={elem.text} intent={elem.intent} />);
      expect(screen.getByTestId('indicator')).toHaveClass(elem.classname);
      expect(screen.getByText(elem.text)).toBeInTheDocument();
    }
  );
  it('External link to blog should be present', () => {
    render(<NodeHealth />, { wrapper: MockedProvider });
    expect(
      screen.getByRole('link', { name: /^Mainnet status & incidents/ })
    ).toBeInTheDocument();
  });
});
