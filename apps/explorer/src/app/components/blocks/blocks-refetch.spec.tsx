import WS from 'jest-websocket-mock';
import useWebSocket from 'react-use-websocket';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TendermintWebsocketContext } from '../../contexts/websocket/tendermint-websocket-context';
import { BlocksRefetch } from './blocks-refetch';

const mocketLocation = 'wss:localhost:3002';

const BlocksRefetchInWebsocketProvider = ({
  callback,
}: {
  callback: () => null;
}) => {
  const contextShape = useWebSocket(mocketLocation);

  return (
    <TendermintWebsocketContext.Provider value={{ ...contextShape }}>
      <BlocksRefetch refetch={callback} />
    </TendermintWebsocketContext.Provider>
  );
};

describe('Blocks refetch', () => {
  const mocket = new WS(mocketLocation);
  const client = new WebSocket(mocketLocation);

  test('the server keeps track of received messages, and yields them as they come in', async () => {
    await mocket.connected;
    client.send('hello');
    await expect(mocket).toReceiveMessage('hello');
    expect(mocket).toHaveReceivedMessages(['hello']);
  });

  test('the server keeps track of received messages, and yields them as they come', async () => {
    await mocket.connected;
    client.send('blah');
    await expect(mocket).toReceiveMessage('blah');
    expect(mocket).toHaveReceivedMessages(['blah']);
  });

  it('should render new blocks text', async () => {
    await mocket.connected;

    act(() => {
      render(<BlocksRefetchInWebsocketProvider callback={() => null} />);
    });

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('new blocks');
  });

  // it('should render refresh button', async () => {
  //   await mocket.connected;
  //   render(RenderComponent(() => null));
  //
  //   expect(screen.getByTestId('refresh')).toBeInTheDocument();
  // });

  // it('should initiate callback when the button is clicked', async () => {
  //   await mocket.connected;
  //   const callback = jest.fn();
  //
  //   act(() => {
  //     render(RenderComponent(callback));
  //     const button = screen.getByTestId('refresh');
  //     fireEvent.click(button);
  //   });
  //
  //   expect(callback.mock.calls.length).toEqual(1);
  // });
});
