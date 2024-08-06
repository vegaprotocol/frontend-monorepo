import { render, screen } from '@testing-library/react';

import { KeyIcon, locators } from '.';

describe('VegaIcon', () => {
  it('renders', () => {
    render(
      <KeyIcon publicKey="104809f388ac734f9105cca259da33b79e1d2dc64f9d649f51ac561bac04ea2b" />
    );
    expect(screen.getByTestId(locators.keyIcon)).toBeInTheDocument();
  });

  it('renders nothing if context cannot be aquired', () => {
    // @ts-ignore
    HTMLCanvasElement.prototype.getContext = () => {
      // return whatever getContext has to return
      return null;
    };
    render(
      <KeyIcon publicKey="104809f388ac734f9105cca259da33b79e1d2dc64f9d649f51ac561bac04ea2b" />
    );
    expect(screen.getByTestId(locators.keyIcon)).toBeInTheDocument();
  });
});
