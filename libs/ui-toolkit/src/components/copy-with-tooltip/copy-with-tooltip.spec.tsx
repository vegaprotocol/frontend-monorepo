import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { CopyWithTooltip, TOOLTIP_TIMEOUT } from './copy-with-tooltip';

jest.useFakeTimers();

test('CopyWithTooltip', async () => {
  const copyText = 'Text to be copied';
  render(
    <CopyWithTooltip text={copyText}>
      <button>Copy</button>
    </CopyWithTooltip>
  );

  fireEvent.click(screen.getByText('Copy'));

  expect(screen.getByRole('tooltip')).toBeInTheDocument();
  await waitForElementToBeRemoved(() => screen.queryByRole('tooltip'));
});
