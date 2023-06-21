import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProposalFormVoteAndEnactmentDeadline } from './proposal-form-vote-and-enactment-deadline';

jest.mock('@vegaprotocol/utils', () => ({
  ...jest.requireActual('@vegaprotocol/utils'),
  getDateTimeFormat: jest.fn(() => ({
    format: (date: Date) => date.toISOString(),
  })),
}));

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
const maxEnactDeadline = '5h0m0s';

/**
 * Formats date according to locale.
 * @param expected Use format: YYYY-MM-DDThh:mm:ss.000Z
 */

const renderComponent = () => {
  const register = jest.fn();
  const setValue = jest.fn();
  render(
    <ProposalFormVoteAndEnactmentDeadline
      onVoteMinMax={setValue}
      voteRegister={register('proposalVoteDeadline')}
      voteErrorMessage={undefined}
      voteMinClose={minVoteDeadline}
      voteMaxClose={maxVoteDeadline}
      onEnactMinMax={setValue}
      enactmentRegister={register('proposalEnactmentDeadline')}
      enactmentErrorMessage={undefined}
      enactmentMinClose={minEnactDeadline}
      enactmentMaxClose={maxEnactDeadline}
      onValidationMinMax={setValue}
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
    expect(enactmentDeadlineInput).toHaveValue(5);
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

  it('should show the correct datetimes', () => {
    renderComponent();
    // Should be adding 2 mins to the vote deadline as the minimum is set by
    // default, and 2 mins are added for wallet confirmation
    expect(screen.getByTestId('voting-date')).toHaveTextContent(
      '2022-01-01T01:02:00.000Z'
    );
    expect(screen.getByTestId('validation-date')).toHaveTextContent(
      '2022-01-01T00:02:00.000Z'
    );
    expect(screen.getByTestId('enactment-date')).toHaveTextContent(
      '2022-01-01T01:02:00.000Z'
    );
    // When max values are used, the deadlines should have 2 seconds subtracted
    // from them to account any delays
    const voteDeadlineMaxButton = screen.getByTestId('max-vote');
    const enactmentDeadlineMaxButton = screen.getByTestId('max-enactment');
    const validationDeadlineMaxButton = screen.getByTestId('max-validation');
    fireEvent.click(voteDeadlineMaxButton);
    fireEvent.click(enactmentDeadlineMaxButton);
    fireEvent.click(validationDeadlineMaxButton);
    expect(screen.getByTestId('voting-date')).toHaveTextContent(
      '2022-01-01T04:59:58.000Z'
    );
    expect(screen.getByTestId('validation-date')).toHaveTextContent(
      '2022-01-01T04:59:58.000Z'
    );
    expect(screen.getByTestId('enactment-date')).toHaveTextContent(
      '2022-01-01T04:59:58.000Z'
    );
  });

  it('should be updating every second, so show the correct datetimes when 30 seconds have passed', () => {
    renderComponent();
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByTestId('voting-date')).toHaveTextContent(
      '2022-01-01T01:02:30.000Z'
    );
    expect(screen.getByTestId('validation-date')).toHaveTextContent(
      '2022-01-01T00:02:30.000Z'
    );
    expect(screen.getByTestId('enactment-date')).toHaveTextContent(
      '2022-01-01T01:02:30.000Z'
    );
  });

  it('updates the validation deadline max and date when the vote deadline max is changed', () => {
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
      '2022-01-01T04:59:58.000Z'
    );
    expect(validationDeadlineInput).toHaveValue(5);
    fireEvent.click(voteDeadlineMinButton);
    expect(screen.getByTestId('validation-date')).toHaveTextContent(
      '2022-01-01T01:00:00.000Z'
    );
    expect(validationDeadlineInput).toHaveValue(1);
  });

  it('displays error text if the vote deadline is set later than the enactment deadline', () => {
    renderComponent();
    const voteDeadlineInput = screen.getByTestId('proposal-vote-deadline');
    const enactmentDeadlineInput = screen.getByTestId(
      'proposal-enactment-deadline'
    );
    fireEvent.change(voteDeadlineInput, { target: { value: 5 } });
    fireEvent.change(enactmentDeadlineInput, { target: { value: 2 } });
    expect(
      screen.getByTestId('enactment-before-voting-deadline')
    ).toHaveTextContent(
      'The proposal will fail if enactment is earlier than the voting deadline'
    );
  });

  it('displays error text if the vote deadline is set earlier than the minimum allowed', () => {
    renderComponent();
    const voteDeadlineInput = screen.getByTestId('proposal-vote-deadline');
    fireEvent.change(voteDeadlineInput, { target: { value: 0.01 } });
    expect(screen.getByTestId('voting-less-than-min')).toHaveTextContent(
      'The proposal will fail if voting deadline is below the minimum'
    );
  });

  it('displays error text if the vote deadline is set later than the maximum allowed', () => {
    renderComponent();
    const voteDeadlineInput = screen.getByTestId('proposal-vote-deadline');
    fireEvent.change(voteDeadlineInput, { target: { value: 100000 } });
    expect(screen.getByTestId('voting-greater-than-max')).toHaveTextContent(
      'The proposal will fail if voting deadline is above the maximum'
    );
  });

  it('displays error text if the enactment deadline is set earlier than the minimum allowed', () => {
    renderComponent();
    const enactmentDeadlineInput = screen.getByTestId(
      'proposal-enactment-deadline'
    );
    fireEvent.change(enactmentDeadlineInput, { target: { value: 0.01 } });
    expect(screen.getByTestId('enactment-less-than-min')).toHaveTextContent(
      'The proposal will fail if enactment deadline is below the minimum'
    );
  });

  it('displays error text if the enactment deadline is set later than the maximum allowed', () => {
    renderComponent();
    const enactmentDeadlineInput = screen.getByTestId(
      'proposal-enactment-deadline'
    );
    fireEvent.change(enactmentDeadlineInput, { target: { value: 100000 } });
    expect(screen.getByTestId('enactment-greater-than-max')).toHaveTextContent(
      'The proposal will fail if enactment deadline is above the maximum'
    );
  });
});
