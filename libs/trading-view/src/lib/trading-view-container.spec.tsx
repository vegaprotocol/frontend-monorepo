import { render, screen } from '@testing-library/react';
import { TradingViewContainer } from './trading-view-container';
import * as useScriptModule from '@vegaprotocol/react-helpers';
import { CHARTING_LIBRARY_FILE } from './constants';

jest.mock('./trading-view', () => ({
  TradingView: ({ marketId }: { marketId: string }) => (
    <div data-testid="trading-view">{marketId}</div>
  ),
}));

describe('TradingView', () => {
  const props = {
    libraryPath: 'foo',
    libraryHash: 'hash',
    marketId: 'marketId',
  };
  const renderComponent = () => render(<TradingViewContainer {...props} />);

  it.each(['loading', 'idle'])(
    'renders loading state when script is %s',
    (state: string) => {
      const spyOnScript = jest
        .spyOn(useScriptModule, 'useScript')
        .mockReturnValue(state as 'idle' | 'loading');

      renderComponent();

      expect(screen.getByText('Loading Trading View')).toBeInTheDocument();
      expect(spyOnScript).toHaveBeenCalledWith(
        props.libraryPath + CHARTING_LIBRARY_FILE,
        props.libraryHash
      );
    }
  );

  it('renders error state if script fails to load', () => {
    jest.spyOn(useScriptModule, 'useScript').mockReturnValue('error');

    renderComponent();

    expect(
      screen.getByText('Failed to initialize Trading view')
    ).toBeInTheDocument();
  });

  it('renders TradingView if script loads successfully', () => {
    jest.spyOn(useScriptModule, 'useScript').mockReturnValue('ready');

    renderComponent();

    expect(screen.getByTestId('trading-view')).toHaveTextContent(
      props.marketId
    );
  });
});
