import WS from 'jest-websocket-mock';
import { render, screen } from '@testing-library/react';
import { BlocksRefetch } from './blocks-refetch';

const BlocksRefetchInWebsocketProvider = ({
  callback,
}: {
  callback: () => null;
}) => {
  return <BlocksRefetch refetch={callback} />;
};

describe('Blocks refetch', () => {
  it('should render inner components', async () => {
    const mocketLocation = 'wss:localhost:3002';
    const mocket = new WS(mocketLocation, { jsonProtocol: true });
    new WebSocket(mocketLocation);

    render(<BlocksRefetchInWebsocketProvider callback={() => null} />);
    expect(screen.getByTestId('refresh')).toBeInTheDocument();
    mocket.close();
  });
});
