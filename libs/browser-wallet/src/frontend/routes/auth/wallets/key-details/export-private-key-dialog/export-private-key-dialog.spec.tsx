import { fireEvent, render, screen } from '@testing-library/react';

import { ExportPrivateKeysDialog, locators } from './export-private-key-dialog';
import { ExportPrivateKeyFormProperties } from './export-private-key-form';
import { ViewPrivateKeyProperties } from './view-private-key';

jest.mock('./export-private-key-form', () => ({
  ExportPrivateKeyForm: (properties: ExportPrivateKeyFormProperties) => (
    <div data-testid="export-private-key-form">
      <button onClick={properties.onClose} data-testid="close" />
      <button
        onClick={() => properties.onSuccess('0x1')}
        data-testid="set-private-key"
      />
    </div>
  ),
}));

jest.mock('./view-private-key', () => ({
  ViewPrivateKey: (properties: ViewPrivateKeyProperties) => (
    <button onClick={properties.onClose} data-testid="view-private-key" />
  ),
}));

describe('ExportPrivateKeyDialog', () => {
  it('renders export button', () => {
    render(<ExportPrivateKeysDialog publicKey="" />);
    expect(screen.getByTestId(locators.privateKeyTrigger)).toBeInTheDocument();
    expect(screen.getByTestId(locators.privateKeyTrigger)).toHaveTextContent(
      'Export private key'
    );
  });
  it('open dialog when export button is pressed with title', async () => {
    render(<ExportPrivateKeysDialog publicKey="" />);
    fireEvent.click(screen.getByTestId(locators.privateKeyTrigger));
    await screen.findByTestId(locators.privateKeyTitle);
    expect(screen.getByTestId(locators.privateKeyTitle)).toHaveTextContent(
      'Export Private Key'
    );
  });
  it('renders form when private key has yet to be loaded', async () => {
    render(<ExportPrivateKeysDialog publicKey="" />);
    fireEvent.click(screen.getByTestId(locators.privateKeyTrigger));
    await screen.findByTestId(locators.privateKeyTitle);
    expect(screen.getByTestId('export-private-key-form')).toBeInTheDocument();
  });
  it('renders private key view when private key is loaded', async () => {
    render(<ExportPrivateKeysDialog publicKey="" />);
    fireEvent.click(screen.getByTestId(locators.privateKeyTrigger));
    await screen.findByTestId(locators.privateKeyTitle);
    fireEvent.click(screen.getByTestId('set-private-key'));
    await screen.findByTestId('view-private-key');
    expect(screen.getByTestId('view-private-key')).toBeInTheDocument();
  });
  it('resets asset dialog on close of form', async () => {
    render(<ExportPrivateKeysDialog publicKey="" />);
    fireEvent.click(screen.getByTestId(locators.privateKeyTrigger));
    await screen.findByTestId(locators.privateKeyTitle);
    fireEvent.click(screen.getByTestId('close'));
    expect(
      screen.queryByTestId(locators.privateKeyTitle)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId(locators.privateKeyTrigger));
    await screen.findByTestId(locators.privateKeyTitle);
    expect(screen.getByTestId('export-private-key-form')).toBeInTheDocument();
  });
  it('resets asset dialog on close of view', async () => {
    render(<ExportPrivateKeysDialog publicKey="" />);
    // Open dialog
    fireEvent.click(screen.getByTestId(locators.privateKeyTrigger));
    await screen.findByTestId(locators.privateKeyTitle);
    // Set the private key
    fireEvent.click(screen.getByTestId('set-private-key'));
    await screen.findByTestId('view-private-key');
    // Close the dialog
    fireEvent.click(screen.getByTestId('view-private-key'));
    expect(
      screen.queryByTestId(locators.privateKeyTitle)
    ).not.toBeInTheDocument();
    // Open the dialog again
    fireEvent.click(screen.getByTestId(locators.privateKeyTrigger));
    await screen.findByTestId(locators.privateKeyTitle);
    // Ensure the dialog has been reset
    expect(screen.getByTestId('export-private-key-form')).toBeInTheDocument();
  });
});
