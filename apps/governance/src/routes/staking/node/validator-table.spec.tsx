import { render } from '@testing-library/react';
import { AppStateProvider } from '../../../contexts/app-state/app-state-provider';
import { ValidatorTable } from './validator-table';
import { ValidatorStatus } from '@vegaprotocol/types';
import countryData from '../../../components/country-selector/country-data';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

const mockNode = {
  id: 'bb1822715aa86ce0e205aa4c78e9b71cdeaec94596ce72d366f0d50589eb1bf5',
  name: 'Marvin',
  pubkey: 'f45085a3bbce4e8197910448a0f22e7d5e79f8234336053bc11b177b0d70e785',
  infoUrl: 'https://en.wikipedia.org/wiki/Marvin_the_Paranoid_Android',
  location: 'AQ',
  ethereumAddress: '0x6ae2ff81b4a00f2edbed1fe3551ee0e3d81aa4f4',
  stakedByOperator: '3000000000000000000000',
  stakedByDelegates: '1280000000000000000',
  stakedTotal: '3001280000000000000000',
  pendingStake: '0',
  epochData: null,
  rankingScore: {
    rankingScore: '0.3999466965166174',
    stakeScore: '0.1999733482583087',
    performanceScore: '1',
    votingPower: '2000',
    status: ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
  },
};

const mockStakedTotal = '15008.4';
const decimals = 18;

const renderComponent = () =>
  render(
    <TooltipProvider>
      <AppStateProvider>
        <ValidatorTable node={mockNode} stakedTotal={mockStakedTotal} />
      </AppStateProvider>
    </TooltipProvider>
  );

describe('ValidatorTable', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should render a link to the staking guide', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('validator-table-staking-guide-link')).toBeTruthy();
  });

  it('should render the correct node id', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('validator-id')).toHaveTextContent(mockNode.id);
  });

  it('should render the validator description url', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('validator-description-url')).toHaveAttribute(
      'href',
      mockNode.infoUrl
    );
  });

  it('should render the correct validator status', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('validator-status')).toHaveTextContent('Consensus');
  });

  it('should render a link to the validator forum', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('validator-forum-link')).toBeTruthy();
  });

  it('should render the pubkey', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('validator-public-key')).toHaveTextContent(
      mockNode.pubkey
    );
  });

  it('should render the server location', () => {
    const location = countryData.find((c) => c.code === mockNode.location);

    const { getByTestId } = renderComponent();
    expect(getByTestId('validator-server-location')).toHaveTextContent(
      // @ts-ignore - location is not null
      location.name
    );
  });

  it('should render the ethereum address', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('validator-eth-address')).toHaveTextContent(
      mockNode.ethereumAddress
    );
  });

  it('should render the staked by operator', () => {
    const stakedByOperator = formatNumber(
      toBigNum(mockNode.stakedByOperator, decimals)
    );

    const { getByTestId } = renderComponent();
    expect(getByTestId('staked-by-operator')).toHaveTextContent(
      stakedByOperator
    );
  });

  it('should render the staked by delegates', () => {
    const stakedByDelegates = formatNumber(
      toBigNum(mockNode.stakedByDelegates, decimals)
    );

    const { getByTestId } = renderComponent();
    expect(getByTestId('staked-by-delegates')).toHaveTextContent(
      stakedByDelegates
    );
  });

  it('should render the total stake', () => {
    const stakedTotal = formatNumber(toBigNum(mockNode.stakedTotal, decimals));

    const { getByTestId } = renderComponent();
    expect(getByTestId('total-stake')).toHaveTextContent(stakedTotal);
  });

  it('should render the pending stake', () => {
    const pendingStake = formatNumber(
      toBigNum(mockNode.pendingStake, decimals)
    );

    const { getByTestId } = renderComponent();
    expect(getByTestId('pending-stake')).toHaveTextContent(pendingStake);
  });

  it('should render the values calculated by the helper functions', () => {
    // these functions are all tested in shared.spec.ts
    const { getByTestId } = renderComponent();
    expect(getByTestId('stake-percentage')).toBeInTheDocument();
    expect(getByTestId('overstaking-penalty')).toBeInTheDocument();
    expect(getByTestId('performance-penalty')).toBeInTheDocument();
    expect(getByTestId('total-penalties')).toBeInTheDocument();
    expect(getByTestId('unnormalised-voting-power')).toBeInTheDocument();
    expect(getByTestId('normalised-voting-power')).toBeInTheDocument();
  });
});
