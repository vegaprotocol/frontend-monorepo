import WS from 'jest-websocket-mock';
import useWebSocket from 'react-use-websocket';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { TendermintWebsocketContext } from '../../contexts/websocket/tendermint-websocket-context';
import { BlocksRefetch } from './blocks-refetch';

const BlocksRefetchInWebsocketProvider = ({
  callback,
  mocketLocation,
}: {
  callback: () => null;
  mocketLocation: string;
}) => {
  const contextShape = useWebSocket(mocketLocation);

  return (
    <TendermintWebsocketContext.Provider value={{ ...contextShape }}>
      <BlocksRefetch refetch={callback} />
    </TendermintWebsocketContext.Provider>
  );
};

describe('Blocks refetch', () => {
  it('should render inner components', async () => {
    const mocketLocation = 'wss:localhost:3002';
    const mocket = new WS(mocketLocation, { jsonProtocol: true });
    new WebSocket(mocketLocation);

    render(
      <BlocksRefetchInWebsocketProvider
        callback={() => null}
        mocketLocation={mocketLocation}
      />
    );
    await mocket.connected;
    expect(screen.getByTestId('new-blocks')).toHaveTextContent('new blocks');
    expect(screen.getByTestId('refresh')).toBeInTheDocument();
    mocket.close();
  });

  it('should initiate callback when the button is clicked', async () => {
    const mocketLocation = 'wss:localhost:3003';
    const mocket = new WS(mocketLocation, { jsonProtocol: true });
    new WebSocket(mocketLocation);

    const callback = jest.fn();
    render(
      <BlocksRefetchInWebsocketProvider
        callback={callback}
        mocketLocation={mocketLocation}
      />
    );
    await mocket.connected;
    const button = screen.getByTestId('refresh');

    act(() => {
      fireEvent.click(button);
    });

    expect(callback.mock.calls.length).toEqual(1);
    mocket.close();
  });

  it('should show new blocks as websocket is correctly updated', async () => {
    const mocketLocation = 'wss:localhost:3004';
    const mocket = new WS(mocketLocation, { jsonProtocol: true });
    new WebSocket(mocketLocation);
    render(
      <BlocksRefetchInWebsocketProvider
        callback={() => null}
        mocketLocation={mocketLocation}
      />
    );
    await mocket.connected;

    // Ensuring we send an ID equal to the one the client subscribed with.
    await waitFor(() => expect(mocket.messages.length).toEqual(1));
    // @ts-ignore id on messages
    const id = mocket.messages[0].id;

    const newBlockMessage = {
      id,
      result: {
        query: "tm.event = 'NewBlock'",
      },
    };

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('0 new blocks');

    act(() => {
      mocket.send(newBlockMessage);
    });

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('1 new blocks');

    act(() => {
      mocket.send(newBlockMessage);
    });

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('2 new blocks');
    mocket.close();
  });

  it('will not show new blocks if websocket has wrong ID', async () => {
    const mocketLocation = 'wss:localhost:3005';
    const mocket = new WS(mocketLocation, { jsonProtocol: true });
    new WebSocket(mocketLocation);

    render(
      <BlocksRefetchInWebsocketProvider
        callback={() => null}
        mocketLocation={mocketLocation}
      />
    );
    await mocket.connected;

    // Ensuring we send an ID equal to the one the client subscribed with.
    await waitFor(() => expect(mocket.messages.length).toEqual(1));

    const newBlockMessageBadId = {
      id: 'blahblahblah',
      result: {
        query: "tm.event = 'NewBlock'",
      },
    };

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('0 new blocks');

    act(() => {
      mocket.send(newBlockMessageBadId);
    });

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('0 new blocks');
    mocket.close();
  });
});
