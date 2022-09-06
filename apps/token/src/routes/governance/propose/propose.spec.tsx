import { render, screen } from '@testing-library/react';
import { Propose } from './propose';

describe('Propose', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Propose />);
    expect(baseElement).toBeTruthy();
  });

  it('should render the heading, proposal type question and options', () => {
    render(<Propose />);
    expect(screen.getByText('ProposalTypeQuestion')).toBeTruthy();
    expect(screen.getByText('NetworkParameter')).toBeTruthy();
    expect(screen.getByText('NewMarket')).toBeTruthy();
    expect(screen.getByText('UpdateMarket')).toBeTruthy();
    expect(screen.getByText('NewAsset')).toBeTruthy();
    expect(screen.getByText('Raw')).toBeTruthy();
  });
});
