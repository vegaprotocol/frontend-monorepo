import { render, screen } from '@testing-library/react';

import { locators as dataTableLocators } from '../../../data-table';
import { Submission } from '.';

describe('SubmissionReceipt', () => {
  it('renders order table and badges', () => {
    // 1118-ORDS-001 I can see the order table
    // 1118-ORDS-002 I can see any relevant order badges
    render(
      <Submission
        transaction={{
          orderSubmission: {
            reference: 'foo',
            postOnly: true,
          },
        }}
      />
    );
    const [referenceRow] = screen.getAllByTestId(dataTableLocators.dataRow);
    expect(referenceRow).toHaveTextContent('foo');
    expect(screen.getByText('Post only')).toBeVisible();
  });
});
