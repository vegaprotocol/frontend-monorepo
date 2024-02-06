import { render, screen } from '@testing-library/react';
import { ProposalVolumeDiscountProgramDetails } from './proposal-volume-discount-program-details';

jest.mock('../../../../contexts/app-state/app-state-context', () => ({
  useAppState: () => ({
    appState: {
      decimals: 2,
    },
  }),
}));

const mockChange = {
  __typename: 'UpdateVolumeDiscountProgram' as const,
  benefitTiers: [
    {
      minimumRunningNotionalTakerVolume: '10000',
      volumeDiscountFactor: '0.05',
    },
    {
      minimumRunningNotionalTakerVolume: '50000',
      volumeDiscountFactor: '0.1',
    },
    {
      minimumRunningNotionalTakerVolume: '100000',
      volumeDiscountFactor: '0.15',
    },
    {
      minimumRunningNotionalTakerVolume: '250000',
      volumeDiscountFactor: '0.2',
    },
    {
      minimumRunningNotionalTakerVolume: '500000',
      volumeDiscountFactor: '0.25',
    },
    {
      minimumRunningNotionalTakerVolume: '1000000',
      volumeDiscountFactor: '0.3',
    },
    {
      minimumRunningNotionalTakerVolume: '1500000',
      volumeDiscountFactor: '0.35',
    },
    {
      minimumRunningNotionalTakerVolume: '2000000',
      volumeDiscountFactor: '0.4',
    },
  ],
  endOfProgramTimestamp: '1970-01-01T00:00:01.791568493Z',
  windowLength: 7,
};

describe('ProposalVolumeDiscountProgramDetails', () => {
  it('should not render if proposal is null', () => {
    render(<ProposalVolumeDiscountProgramDetails change={null} />);
    expect(
      screen.queryByTestId('proposal-volume-discount-program-details')
    ).toBeNull();
  });

  it('should render relevant fields if present', () => {
    render(<ProposalVolumeDiscountProgramDetails change={mockChange} />);
    expect(
      screen.getByTestId('proposal-volume-discount-program-window-length')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        'proposal-volume-discount-program-end-of-program-timestamp'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('proposal-volume-discount-program-benefit-tiers')
    ).toBeInTheDocument();
  });
});
