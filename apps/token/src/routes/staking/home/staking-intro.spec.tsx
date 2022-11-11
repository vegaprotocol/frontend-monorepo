import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { StakingIntro } from './staking-intro';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    VEGA_DOCS_URL: 'https://docs.vega.xyz',
  }),
}));

describe('Staking', () => {
  it('should render the component', () => {
    render(
      <Router>
        <StakingIntro />
      </Router>
    );
    expect(screen.getByTestId('staking-intro')).toBeInTheDocument();
    expect(screen.getByTestId('callout')).toBeInTheDocument();
    expect(
      screen.getByText(
        '1. VEGA is an ERC20 token. Associate it with a Vega wallet using the'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('staking-associate-link')).toBeInTheDocument();
    expect(
      screen.getByText(
        '2. Use this site and your Vega wallet to nominate a validator. View the validator profile pitches and discussion'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('validator-forum-link')).toBeInTheDocument();
    expect(
      screen.getByText(
        '3. Earn a share of trading fees and treasury rewards for each full epoch staked'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('4. Move your stake if your validator is penalised')
    ).toBeInTheDocument();
    expect(screen.getByTestId('staking-guide-link')).toBeInTheDocument();
  });
});
