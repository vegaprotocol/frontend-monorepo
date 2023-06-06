import { render } from '@testing-library/react';
import { VoteIcon } from './vote-icon';

describe('Vote TX icon', () => {
  it('should use the text For by default for yes votes', () => {
    const yes = render(<VoteIcon vote={true} />);
    expect(yes.getByTestId('label')).toHaveTextContent('For');
  });

  it('should use the yesText for yes votes if specified', () => {
    const yes = render(<VoteIcon vote={true} yesText="Test" />);
    expect(yes.getByTestId('label')).toHaveTextContent('Test');
  });

  it('should display the tick icon for yes votes', () => {
    const no = render(<VoteIcon vote={true} />);
    expect(no.getByRole('img')).toHaveAttribute(
      'aria-label',
      'tick-circle icon'
    );
  });

  it('should use the text Against by default for no votes', () => {
    const no = render(<VoteIcon vote={false} />);
    expect(no.getByTestId('label')).toHaveTextContent('Against');
  });

  it('should use the noText for no votes if specified', () => {
    const no = render(<VoteIcon vote={false} noText="Test" />);
    expect(no.getByTestId('label')).toHaveTextContent('Test');
  });

  it('should display the delete icon for no votes', () => {
    const no = render(<VoteIcon vote={false} />);
    expect(no.getByRole('img')).toHaveAttribute('aria-label', 'delete icon');
  });

  it('useVoteColour prop can be used to override coloured background', () => {
    const no = render(<VoteIcon vote={false} />);
    expect(no.container.children[0]).toHaveClass('bg-vega-pink-550');

    const monochromeNo = render(
      <VoteIcon vote={false} useVoteColour={false} />
    );
    expect(monochromeNo.container.children[0]).not.toHaveClass(
      'bg-vega-pink-550'
    );
    expect(monochromeNo.container.children[0]).toHaveClass('bg-vega-dark-200');
  });
});
