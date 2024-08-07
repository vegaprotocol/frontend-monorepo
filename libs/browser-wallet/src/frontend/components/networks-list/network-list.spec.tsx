import { fireEvent, render, screen } from '@testing-library/react';

import { testingNetwork } from '../../../config/well-known-networks';
import { locators, type NetworkListProperties, NetworksList } from './networks-list';

const renderComponent = (properties: NetworkListProperties) => {
  return render(<NetworksList {...properties} />);
};

describe('NetworksList', () => {
  it('renders title and networks', () => {
    renderComponent({
      networks: [testingNetwork],
    });
    expect(screen.getByTestId(locators.networksList)).toBeInTheDocument();
  });
  it('does not render button if onClick is not provided', () => {
    renderComponent({
      networks: [testingNetwork],
    });
    expect(screen.getByTestId(locators.networksList)).toBeInTheDocument();
    expect(
      screen.queryByTestId(locators.networkListButton(testingNetwork.name))
    ).not.toBeInTheDocument();
  });
  it('calls onClick if button is rendered and button is clicked', () => {
    const onClick = jest.fn();
    renderComponent({
      networks: [testingNetwork],
      onClick,
    });
    expect(
      screen.getByTestId(locators.networkListButton(testingNetwork.name))
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId(locators.networkListButton(testingNetwork.name))
    );
    expect(onClick).toHaveBeenCalledWith(testingNetwork);
  });
});
