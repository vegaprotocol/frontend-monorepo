import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProposalFormVoteAndEnactmentDeadline } from './proposal-form-vote-and-enactment-deadline';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01T00:00:00.000Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

const minVoteDeadline = '1h0m0s';
const maxVoteDeadline = '5h0m0s';
const minEnactDeadline = '1h0m0s';
const maxEnactDeadline = '4h0m0s';

const renderComponent = () => {
  const register = jest.fn();
  render(
    <ProposalFormVoteAndEnactmentDeadline
      voteRegister={register('proposalVoteDeadline')}
      voteErrorMessage={undefined}
      voteMinClose={minVoteDeadline}
      voteMaxClose={maxVoteDeadline}
      enactmentRegister={register('proposalEnactmentDeadline')}
      enactmentErrorMessage={undefined}
      enactmentMinClose={minEnactDeadline}
      enactmentMaxClose={maxEnactDeadline}
      validationRequired={true}
      validationRegister={register('proposalValidationDeadline')}
      validationErrorMessage={undefined}
    />
  );
};

describe('Proposal form vote, validation and enactment deadline', () => {
  it('should render all component parts successfully', () => {
    renderComponent();
    expect(screen.getByTestId('proposal-vote-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-enactment-deadline')).toBeTruthy();
    expect(screen.getByTestId('proposal-validation-deadline')).toBeTruthy();
  });

  it('should have the correct initial values', () => {
    renderComponent();
    const deadlineInput = screen.getByTestId('proposal-vote-deadline');
    expect(deadlineInput).toHaveValue(1);
    const enactmentDeadlineInput = screen.getByTestId(
      'proposal-enactment-deadline'
    );
    expect(enactmentDeadlineInput).toHaveValue(1);
    const validationDeadlineInput = screen.getByTestId(
      'proposal-validation-deadline'
    );
    expect(validationDeadlineInput).toHaveValue(0);
  });

  it('should use the voting max and min values when the buttons are clicked', () => {
    renderComponent();
    const voteDeadlineInput = screen.getByTestId('proposal-vote-deadline');
    const maxButton = screen.getByTestId('max-vote');
    const minButton = screen.getByTestId('min-vote');
    fireEvent.click(maxButton);
    expect(voteDeadlineInput).toHaveValue(5);
    fireEvent.click(minButton);
    expect(voteDeadlineInput).toHaveValue(1);
  });

  it('should use the validation max and min values when the buttons are clicked', () => {
    renderComponent();
    const validationDeadlineInput = screen.getByTestId(
      'proposal-validation-deadline'
    );
    const maxButton = screen.getByTestId('max-validation');
    const minButton = screen.getByTestId('min-validation');
    fireEvent.click(maxButton);
    // Note: the validation max value is determined by the vote deadline max value,
    // which will currently be the default value of 1
    expect(validationDeadlineInput).toHaveValue(1);
    fireEvent.click(minButton);
    expect(validationDeadlineInput).toHaveValue(0);
  });

  it('should update the validation deadline max value when the vote deadline value changes', () => {
    renderComponent();
    const voteDeadlineInput = screen.getByTestId('proposal-vote-deadline');
    const validationDeadlineInput = screen.getByTestId(
      'proposal-validation-deadline'
    );
    const maxButton = screen.getByTestId('max-validation');
    fireEvent.change(voteDeadlineInput, { target: { value: 2 } });
    fireEvent.click(maxButton);
    expect(validationDeadlineInput).toHaveValue(2);
  });

  it('should use the enactment max and min values when the buttons are clicked', () => {
    renderComponent();
    const enactmentDeadlineInput = screen.getByTestId(
      'proposal-enactment-deadline'
    );
    const maxButton = screen.getByTestId('max-enactment');
    const minButton = screen.getByTestId('min-enactment');
    fireEvent.click(maxButton);
    expect(enactmentDeadlineInput).toHaveValue(4);
    fireEvent.click(minButton);
    expect(enactmentDeadlineInput).toHaveValue(1);
  });

  it('should show the 2 mins extra message when the vote deadline is set to minimum', () => {
    renderComponent();
    const voteDeadlineInput = screen.getByTestId('proposal-vote-deadline');
    const minButton = screen.getByTestId('min-vote');
    fireEvent.click(minButton);
    expect(voteDeadlineInput).toHaveValue(1);
    expect(screen.getByTestId('voting-2-mins-extra')).toBeTruthy();
  });

  it('should show the 2 mins extra message when the validation deadline is set to minimum', () => {
    renderComponent();
    const validationDeadlineInput = screen.getByTestId(
      'proposal-validation-deadline'
    );
    const minButton = screen.getByTestId('min-validation');
    fireEvent.click(minButton);
    expect(validationDeadlineInput).toHaveValue(0);
    expect(screen.getByTestId('validation-2-mins-extra')).toBeTruthy();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should show the correct datetimes', () => {
    renderComponent();
    // Should be adding 2 mins to the vote deadline as the minimum is set by
    // default, and we add 2 mins for wallet confirmation
    expect(screen.getByTestId('voting-date')).toHaveTextContent(
      '1/1/2022, 1:02:00 AM'
    );
    expect(screen.getByTestId('validation-date')).toHaveTextContent(
      '1/1/2022, 12:02:00 AM'
    );
    expect(screen.getByTestId('enactment-date')).toHaveTextContent(
      '1/1/2022, 2:00:00 AM'
    );
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should be updating every second, so show the correct datetimes when 30 seconds have passed', () => {
    renderComponent();
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByTestId('voting-date')).toHaveTextContent(
      '1/1/2022, 1:02:30 AM'
    );
    expect(screen.getByTestId('validation-date')).toHaveTextContent(
      '1/1/2022, 12:02:30 AM'
    );
    expect(screen.getByTestId('enactment-date')).toHaveTextContent(
      '1/1/2022, 2:00:30 AM'
    );
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('update the vote deadline date and the enactment deadline date when the vote deadline is changed', () => {
    renderComponent();
    const voteDeadlineInput = screen.getByTestId('proposal-vote-deadline');
    fireEvent.change(voteDeadlineInput, { target: { value: 2 } });
    expect(screen.getByTestId('voting-date')).toHaveTextContent(
      '1/1/2022, 2:00:00 AM'
    );
    expect(screen.getByTestId('enactment-date')).toHaveTextContent(
      '1/1/2022, 3:00:00 AM'
    );
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('updates the validation deadline max and date when the vote deadline max is changed', () => {
    renderComponent();
    const voteDeadlineMinButton = screen.getByTestId('min-vote');
    const voteDeadlineMaxButton = screen.getByTestId('max-vote');
    const validationDeadlineMaxButton = screen.getByTestId('max-validation');
    const validationDeadlineInput = screen.getByTestId(
      'proposal-validation-deadline'
    );
    fireEvent.click(voteDeadlineMaxButton);
    fireEvent.click(validationDeadlineMaxButton);
    expect(screen.getByTestId('validation-date')).toHaveTextContent(
      '1/1/2022, 5:00:00 AM'
    );
    expect(validationDeadlineInput).toHaveValue(5);
    fireEvent.click(voteDeadlineMinButton);
    expect(screen.getByTestId('validation-date')).toHaveTextContent(
      '1/1/2022, 1:00:00 AM'
    );
    expect(validationDeadlineInput).toHaveValue(1);
  });
});
