import { fireEvent, render, screen } from '@testing-library/react';
import { ProposalFormDownloadJson } from './proposal-form-download-json';

describe('ProposalFormDownloadJson', () => {
  it('calls the downloadJson method when the button is clicked', () => {
    const downloadJson = jest.fn();
    render(<ProposalFormDownloadJson downloadJson={downloadJson} />);
    const button = screen.getByTestId('proposal-download-json');

    jest.spyOn(button, 'click').mockImplementation(() => {
      fireEvent.click(button);
    });

    expect(downloadJson).toHaveBeenCalledTimes(0);
    fireEvent.click(button);
    expect(downloadJson).toHaveBeenCalledTimes(1);
  });
});
