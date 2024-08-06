import { fireEvent, render, screen } from '@testing-library/react';

import { HostImage, locators } from '.';

describe('HostImage', () => {
  it('render host image at size specified', () => {
    render(<HostImage hostname="https://www.google.com" size={4} />);
    const img = screen.getByTestId(locators.hostImage);
    expect(img).toHaveStyle('width: 4px; height: 4px;');
  });

  it('falls back square with domain letter if no image is available', () => {
    render(<HostImage hostname="https://www.google.com" />);
    const img = screen.getByTestId(locators.hostImage);
    fireEvent.error(img);
    expect(screen.getByTestId(locators.hostImageFallback)).toHaveTextContent(
      'g'
    );
  });

  it('falls back to a question mark if URL cannot be parsed', () => {
    render(<HostImage hostname="f" />);
    const img = screen.getByTestId(locators.hostImage);
    fireEvent.error(img);
    expect(screen.getByTestId(locators.hostImageFallback)).toHaveTextContent(
      '?'
    );
  });

  it('falls back to a question mark if URL has no domain', () => {
    render(<HostImage hostname="file://" />);
    const img = screen.getByTestId(locators.hostImage);
    fireEvent.error(img);
    expect(screen.getByTestId(locators.hostImageFallback)).toHaveTextContent(
      '?'
    );
  });
});
