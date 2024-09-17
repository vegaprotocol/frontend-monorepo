import { fireEvent, render, screen } from '@testing-library/react';

import {
  ExportRecoveryPhraseSection,
  locators,
} from './export-recovery-phrase-section';
import { type ViewRecoveryPhraseProperties } from './view-recovery-phrase';

jest.mock('./view-recovery-phrase', () => ({
  ViewRecoveryPhrase: (properties: ViewRecoveryPhraseProperties) => (
    <button onClick={properties.onClose} data-testid="view-recovery-phrase" />
  ),
}));

describe('ExportRecoveryPhraseSection', () => {
  it('renders export button', () => {
    render(<ExportRecoveryPhraseSection />);
    expect(
      screen.getByTestId(locators.exportRecoveryPhraseTrigger)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.exportRecoveryPhraseTrigger)
    ).toHaveTextContent('Export recovery phrase');
  });
  it('open dialog when export button is pressed with title', async () => {
    // 1138-EXRP-002 When I click on export recovery phrase I am present with a modal to enter my password
    render(<ExportRecoveryPhraseSection />);

    fireEvent.click(screen.getByTestId(locators.exportRecoveryPhraseTrigger));
    await screen.findByTestId(locators.exportRecoveryPhraseTitle);
    expect(
      screen.getByTestId(locators.exportRecoveryPhraseTitle)
    ).toHaveTextContent('Export Recovery Phrase');
  });
  it('renders form when private key has yet to be loaded', async () => {
    render(<ExportRecoveryPhraseSection />);

    fireEvent.click(screen.getByTestId(locators.exportRecoveryPhraseTrigger));
    await screen.findByTestId(locators.exportRecoveryPhraseTitle);
    expect(
      screen.getByTestId('export-recovery-phrase-form')
    ).toBeInTheDocument();
  });
  it('renders private key view when private key is loaded', async () => {
    render(<ExportRecoveryPhraseSection />);

    fireEvent.click(screen.getByTestId(locators.exportRecoveryPhraseTrigger));
    await screen.findByTestId(locators.exportRecoveryPhraseTitle);
    fireEvent.click(screen.getByTestId('set-private-key'));
    await screen.findByTestId('view-recovery-phrase');
    expect(screen.getByTestId('view-recovery-phrase')).toBeInTheDocument();
  });
  it('resets asset dialog on close of form', async () => {
    render(<ExportRecoveryPhraseSection />);

    fireEvent.click(screen.getByTestId(locators.exportRecoveryPhraseTrigger));
    await screen.findByTestId(locators.exportRecoveryPhraseTitle);
    fireEvent.click(screen.getByTestId('close'));
    expect(
      screen.queryByTestId(locators.exportRecoveryPhraseTitle)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId(locators.exportRecoveryPhraseTrigger));
    await screen.findByTestId(locators.exportRecoveryPhraseTitle);
    expect(
      screen.getByTestId('export-recovery-phrase-form')
    ).toBeInTheDocument();
  });
  it('resets asset dialog on close of view', async () => {
    render(<ExportRecoveryPhraseSection />);

    // Open dialog
    fireEvent.click(screen.getByTestId(locators.exportRecoveryPhraseTrigger));
    await screen.findByTestId(locators.exportRecoveryPhraseTitle);
    // Set the private key
    fireEvent.click(screen.getByTestId('set-private-key'));
    await screen.findByTestId('view-recovery-phrase');
    // Close the dialog
    fireEvent.click(screen.getByTestId('view-recovery-phrase'));
    expect(
      screen.queryByTestId(locators.exportRecoveryPhraseTitle)
    ).not.toBeInTheDocument();
    // Open the dialog again
    fireEvent.click(screen.getByTestId(locators.exportRecoveryPhraseTrigger));
    await screen.findByTestId(locators.exportRecoveryPhraseTitle);
    // Ensure the dialog has been reset
    expect(
      screen.getByTestId('export-recovery-phrase-form')
    ).toBeInTheDocument();
  });
});
