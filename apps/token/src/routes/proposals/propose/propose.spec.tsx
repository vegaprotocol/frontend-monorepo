import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Propose } from './propose';

const renderComponent = () =>
  render(
    <Router>
      <Propose />
    </Router>
  );

describe('Propose', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render the heading, proposal type question and options', () => {
    renderComponent();
    expect(
      screen.getByText('What type of proposal would you like to make?')
    ).toBeTruthy();
    expect(screen.getByText('Network parameter')).toBeTruthy();
    expect(screen.getByText('New market')).toBeTruthy();
    expect(screen.getByText('Update market')).toBeTruthy();
    expect(screen.getByText('New asset')).toBeTruthy();
    expect(screen.getByText('Update asset')).toBeTruthy();
    expect(screen.getByText('Freeform')).toBeTruthy();
    expect(screen.getByText('Let me choose (raw proposal)')).toBeTruthy();
  });
});
