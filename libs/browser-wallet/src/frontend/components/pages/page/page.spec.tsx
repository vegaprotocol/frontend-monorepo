import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { locators as headerLocators } from '../../header';
import { locators } from '../page';
import { BasePage } from './page';

describe('Page', () => {
  it('renders page header correctly', () => {
    render(
      <MemoryRouter>
        <BasePage dataTestId="foo" title="Test Page">
          <span>Page</span>
        </BasePage>
      </MemoryRouter>
    );
    expect(screen.getByTestId(headerLocators.header)).toBeInTheDocument();
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('renders back button correctly', () => {
    render(
      <BasePage dataTestId="foo" title="Test Page" backLocation="/test">
        <span>Page</span>
      </BasePage>,
      {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      }
    );
    expect(screen.getByTestId(locators.basePageBack)).toHaveAttribute(
      'href',
      '/test'
    );
  });

  it('renders children correctly', () => {
    render(
      <MemoryRouter>
        <BasePage dataTestId="foo" title="Test Page">
          <div data-testid="test-child" />
        </BasePage>
      </MemoryRouter>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('calls onBack when back button is pressed', async () => {
    const onBack = jest.fn();
    render(
      <MemoryRouter>
        <BasePage
          onBack={onBack}
          dataTestId="foo"
          title="Test Page"
          backLocation="/test"
        >
          <div data-testid="test-child" />
        </BasePage>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId(locators.basePageBack));
    await waitFor(() => expect(onBack).toHaveBeenCalled());
  });

  it('does not require onBack to be provided', async () => {
    render(
      <MemoryRouter>
        <BasePage dataTestId="foo" title="Test Page" backLocation="/test">
          <div data-testid="test-child" />
        </BasePage>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId(locators.basePageBack));
  });
});
