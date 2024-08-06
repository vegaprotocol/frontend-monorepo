import { fireEvent, render, screen } from '@testing-library/react';

import componentLocators from '@/components/locators';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { FULL_ROUTES } from '../../route-names';
import { GetStarted, locators } from '.';
import { locators as disclaimerLocators } from './disclaimer';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

const renderComponent = () =>
  render(
    <MockNetworkProvider>
      <GetStarted />
    </MockNetworkProvider>
  );

describe('GetStarted', () => {
  it('renders title', () => {
    renderComponent();
    expect(screen.getByTestId(componentLocators.vegaIcon)).toBeInTheDocument();
    expect(screen.getByTestId(componentLocators.vega)).toBeInTheDocument();
    expect(screen.getByText('wallet')).toBeInTheDocument();
  });
  it('renders list of reasons to use vega wallet & get started button', () => {
    renderComponent();

    expect(
      screen.getByText('Securely connect to Vega dapps')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Instantly approve and reject transactions')
    ).toBeInTheDocument();
    expect(screen.getByTestId(locators.getStartedButton)).toHaveTextContent(
      'I understand'
    );
  });
  it('Redirects to the create password route when button is clicked', () => {
    renderComponent();

    const button = screen.getByTestId(locators.getStartedButton);
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(mockedUsedNavigate).toHaveBeenCalledWith(FULL_ROUTES.createPassword);
  });
  it('Renders disclaimer', async () => {
    // 1101-ONBD-033 I can see a legal disclaimer with a button to read more
    // 1101-ONBD-034 I can press read more to see the full disclaimer
    renderComponent();

    expect(
      screen.getByTestId(disclaimerLocators.readMoreButton)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(disclaimerLocators.previewText)
    ).toBeInTheDocument();
    expect(screen.getByTestId(locators.getStartedButton)).toHaveTextContent(
      'I understand'
    );
    fireEvent.click(screen.getByTestId(disclaimerLocators.readMoreButton));
    await screen.findByTestId(disclaimerLocators.disclaimerText);
    expect(
      screen.getByTestId(disclaimerLocators.disclaimerText)
    ).toBeInTheDocument();
  });
});
