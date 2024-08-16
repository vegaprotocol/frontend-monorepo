import { render, screen } from '@testing-library/react';

import { useGlobalsStore } from '@/stores/globals';
import { mockStore } from '@/test-helpers/mock-store';

import { ExternalLink, locators } from './external-link';

jest.mock('@/stores/globals');

describe('ExternalLink component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('renders ExternalLink component correctly', () => {
    render(
      <ExternalLink href="https://example.com">Example Link</ExternalLink>
    );

    expect(screen.getByTestId('external-link')).toHaveTextContent(
      'Example Link'
    );
    expect(screen.getByTestId('external-link')).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  it('renders MobileLink component when isMobile is true', () => {
    mockStore(useGlobalsStore, { isMobile: true });

    render(
      <ExternalLink href="https://example.com">Example Link</ExternalLink>
    );
    expect(screen.getByTestId(locators.externalLink)).toBeInTheDocument();
  });

  it('renders MobileLink component with sub components isMobile is true', () => {
    mockStore(useGlobalsStore, { isMobile: true });

    render(
      <ExternalLink href="https://example.com">
        <div data-testid="child" />
      </ExternalLink>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders ExLink component when isMobile is false', () => {
    mockStore(useGlobalsStore, { isMobile: false });

    render(
      <ExternalLink href="https://example.com">Example Link</ExternalLink>
    );

    expect(screen.getByTestId('external-link')).toBeInTheDocument();
  });

  it('renders href if children is not defined (desktop)', () => {
    mockStore(useGlobalsStore, { isMobile: false });

    render(<ExternalLink href="https://example.com" />);

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('renders href if children is not defined (mobile)', () => {
    mockStore(useGlobalsStore, { isMobile: true });

    render(<ExternalLink href="https://example.com" />);

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
});
