import { render, screen } from '@testing-library/react';

import { AsyncRenderer } from './async-renderer';

describe('AsyncRenderer', () => {
  it('should render loading content when loading is true', () => {
    render(
      <AsyncRenderer
        render={() => <div>Content</div>}
        loading
        renderLoading={() => <div>Loading...</div>}
      />
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error view when an error is provided', () => {
    const error = new Error('Test error');
    render(
      <AsyncRenderer
        render={() => <div>Content</div>}
        error={error}
        errorView={(error_) => <div>Error: {error_.message}</div>}
      />
    );
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  it('should render no data content when noData is true', () => {
    render(
      <AsyncRenderer
        render={() => <div>Content</div>}
        noData
        renderNoData={() => <div>No data available.</div>}
      />
    );
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('should render the content when loading, error, and noData are all false', () => {
    render(<AsyncRenderer render={() => <div>Content</div>} />);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should not render loading content when loading is false', () => {
    render(
      <AsyncRenderer
        render={() => <div>Content</div>}
        renderLoading={() => <div>Loading...'</div>}
      />
    );
    expect(screen.queryByText('Loading...')).toBeNull();
  });

  it('should not render error view when error is not provided', () => {
    render(
      <AsyncRenderer
        render={() => <div>Content</div>}
        errorView={(error) => <div>Error: {error.message}</div>}
      />
    );
    expect(screen.queryByText('Error:')).toBeNull();
  });

  it('should not render no data content when noData is false', () => {
    render(
      <AsyncRenderer
        render={() => <div>Content</div>}
        renderNoData={() => <div>No data available.</div>}
      />
    );
    expect(screen.queryByText('No data available.')).toBeNull();
  });

  it('should render nothing if loading is true but render loading is not defined', () => {
    const { container } = render(
      <AsyncRenderer render={() => <div>Content</div>} loading={true} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing if error is true but render error is not defined', () => {
    const { container } = render(
      <AsyncRenderer
        render={() => <div>Content</div>}
        error={new Error('123')}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing if noData is true but render noData is not defined', () => {
    const { container } = render(
      <AsyncRenderer render={() => <div>Content</div>} noData={true} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
