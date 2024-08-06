import { render, screen } from '@testing-library/react';

import { locators as headerLocators } from '@/components/header';

import locators from '../../locators';
import { ConnectionHeader } from './connection-header';

jest.mock('../../host-image', () => ({
  HostImage: () => <div data-testid="host-image"></div>,
}));
jest.mock('../../icons/vega-icon', () => ({
  VegaIcon: () => <div data-testid="vega-icon"></div>,
}));

describe('ModalHeader', () => {
  it('renders title, image and vega icon', () => {
    render(
      <ConnectionHeader hostname="https://www.google.com" title="title" />
    );
    expect(screen.getByTestId('host-image')).toBeInTheDocument();
    expect(screen.getByTestId('vega-icon')).toBeInTheDocument();
    expect(screen.getByTestId(headerLocators.header)).toHaveTextContent(
      'title'
    );
    expect(screen.getByTestId(locators.dAppHostname)).toHaveTextContent(
      'https://www.google.com'
    );
  });
});
