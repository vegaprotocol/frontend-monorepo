import { render, screen } from '@testing-library/react';

import { locators as headerLocators } from '../../header';
import locators from '../../locators';
import { ConnectionSuccess } from './connection-success';

describe('ConnectionSuccess', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it('renders title and hostname', () => {
    render(<ConnectionSuccess onClose={jest.fn()} hostname="test" />);
    expect(screen.getByTestId(headerLocators.header)).toHaveTextContent(
      'Connected'
    );
    expect(
      screen.getByTestId(locators.connectionSuccessHostname)
    ).toHaveTextContent('test');
  });
  it('call on close after some time', () => {
    const onClose = jest.fn();
    render(<ConnectionSuccess onClose={onClose} hostname="test" />);
    jest.runAllTimers();
    expect(onClose).toHaveBeenCalled();
  });
});
