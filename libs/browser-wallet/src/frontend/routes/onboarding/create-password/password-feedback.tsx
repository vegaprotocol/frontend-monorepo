import { InputError } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import zxcvbn from 'zxcvbn';

const COLORS = [
  'bg-vega-yellow-650',
  'bg-vega-yellow-600',
  'bg-vega-yellow-550',
  'bg-vega-yellow-500',
  'bg-vega-yellow-450',
];

export const locators = {
  error: 'password-feedback-error',
  feedbackStrength: 'password-feedback-strength',
  passwordFeedback: 'password-feedback',
};

export const PasswordFeedback = ({ password }: { password: string }) => {
  const passwordStrength = zxcvbn(password);
  const combinedFeedback = [
    passwordStrength.feedback.warning,
    ...passwordStrength.feedback.suggestions,
  ].filter(Boolean);
  const feedback = combinedFeedback.map((s) => s.replace(/\.$/, '')).join('. ');
  if (!password) return null;
  return (
    <>
      <div
        data-testid={locators.passwordFeedback}
        className="grid grid-cols-4 gap-1 mt-1"
      >
        {Array.from({ length: 4 })
          .fill(0)
          .map((_, index) => (
            <div
              data-testid={locators.feedbackStrength}
              key={`password-feedback-bar-${index}`}
              className={classNames('h-1 rounded-md', {
                'bg-vega-dark-150': passwordStrength.score < index + 1,
                [COLORS[index]]: passwordStrength.score >= index + 1,
              })}
            ></div>
          ))}
      </div>
      {combinedFeedback.length > 0 ? (
        <InputError data-testid={locators.error} forInput="password">
          {feedback}.
        </InputError>
      ) : null}
    </>
  );
};
