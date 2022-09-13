import { render, screen } from '@testing-library/react';
import { ProposalFormTransactionDialog } from './proposal-form-transaction-dialog';

const mockTransactionDialog = jest
  .fn()
  .mockImplementation(() => <div>Mock Transaction Dialog</div>);

describe('Proposal Form Transaction Dialog', () => {
  it('should render', () => {
    render(
      <ProposalFormTransactionDialog
        finalizedProposal={null}
        TransactionDialog={mockTransactionDialog}
      />
    );
    expect(screen.getByText('Mock Transaction Dialog')).toBeTruthy();
  });
});
