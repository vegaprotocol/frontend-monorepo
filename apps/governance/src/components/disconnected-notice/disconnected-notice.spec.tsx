import { render, screen } from '@testing-library/react';
import { DisconnectedNotice } from './disconnected-notice';

describe('DisconnectedNotice', () => {
  it('renders Notification when isDisconnected is true and correctNetworkChainId is valid', () => {
    render(
      <DisconnectedNotice isDisconnected={true} correctNetworkChainId={'1'} />
    );
    const disconnectedNotice = screen.getByTestId('disconnected-notice');
    expect(disconnectedNotice).toBeInTheDocument();
  });

  it("doesn't render Notification when isDisconnected is false", () => {
    render(
      <DisconnectedNotice isDisconnected={false} correctNetworkChainId={'1'} />
    );
    const disconnectedNotice = screen.queryByTestId('disconnected-notice');
    expect(disconnectedNotice).not.toBeInTheDocument();
  });

  it("doesn't render Notification when correctNetworkChainId is undefined", () => {
    render(
      <DisconnectedNotice
        isDisconnected={true}
        correctNetworkChainId={undefined}
      />
    );
    const disconnectedNotice = screen.queryByTestId('disconnected-notice');
    expect(disconnectedNotice).not.toBeInTheDocument();
  });

  it("doesn't render Notification when correctNetworkChainId is null", () => {
    render(
      <DisconnectedNotice isDisconnected={true} correctNetworkChainId={null} />
    );
    const disconnectedNotice = screen.queryByTestId('disconnected-notice');
    expect(disconnectedNotice).not.toBeInTheDocument();
  });
});
