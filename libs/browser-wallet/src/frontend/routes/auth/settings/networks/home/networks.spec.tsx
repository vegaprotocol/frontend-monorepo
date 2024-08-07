import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import locators from '@/components/locators';
import { locators as networkListLocators } from '@/components/networks-list';
import { FULL_ROUTES } from '@/routes/route-names';
import { useNetworksStore } from '@/stores/networks-store';
import { mockStore } from '@/test-helpers/mock-store';

import {
  fairground,
  testingNetwork,
} from '../../../../../../config/well-known-networks';
import { NetworkSettings } from './networks';

jest.mock('@/stores/networks-store');

const renderComponent = () => {
  mockStore(useNetworksStore, {
    networks: [testingNetwork, fairground],
  });
  return render(
    <MemoryRouter>
      <NetworkSettings />
    </MemoryRouter>
  );
};

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('Networks', () => {
  it('lists all configured networks', () => {
    renderComponent();
    const items = screen.getAllByTestId(locators.listItem);
    expect(items).toHaveLength(2);
    const [test, fairground] = items;
    expect(test).toHaveTextContent('Test');
    expect(fairground).toHaveTextContent('Fairground');
  });
  it('navigates to the selected network', () => {
    renderComponent();
    const [test] = screen.getAllByTestId(locators.listItem);
    fireEvent.click(
      within(test).getByTestId(
        networkListLocators.networkListButton(testingNetwork.name)
      )
    );
    expect(mockedUsedNavigate).toHaveBeenCalledWith(
      `${FULL_ROUTES.networksSettings}/${testingNetwork.id}`
    );
  });
});
