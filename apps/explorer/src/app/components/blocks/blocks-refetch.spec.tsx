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
  const mocket = new WS(mocketLocation, { jsonProtocol: true });
  new WebSocket(mocketLocation);

  it('should render inner components', async () => {
    render(<BlocksRefetchInWebsocketProvider callback={() => null} />);
    await mocket.connected;
    expect(screen.getByTestId('new-blocks')).toHaveTextContent('new blocks');
    expect(screen.getByTestId('refresh')).toBeInTheDocument();
  });

  it('should initiate callback when the button is clicked', async () => {
    const callback = jest.fn();
    render(<BlocksRefetchInWebsocketProvider callback={callback} />);
    await mocket.connected;
    const button = screen.getByTestId('refresh');

    act(() => {
      fireEvent.click(button);
    });

    expect(callback.mock.calls.length).toEqual(1);
  });

  it('should show new blocks as websocket is correctly updated', async () => {
    render(<BlocksRefetchInWebsocketProvider callback={() => null} />);
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
  });

  it('will not show new blocks if websocket is incorrectly updated', async () => {
    render(<BlocksRefetchInWebsocketProvider callback={() => null} />);
    await mocket.connected;

    // Ensuring we send an ID equal to the one the client subscribed with.
    await waitFor(() => expect(mocket.messages.length).toEqual(1));
    // @ts-ignore id on messages
    const id = mocket.messages[0].id;

    const newBlockMessageBadResult = {
      id,
      result: {
        query: "tm.event = 'blahblahblah'",
      },
    };

    const newBlockMessageBadId = {
      id: 'blahblahblah',
      result: {
        query: "tm.event = 'NewBlock'",
      },
    };

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('0 new blocks');

    act(() => {
      mocket.send(newBlockMessageBadResult);
    });

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('0 new blocks');

    act(() => {
      mocket.send(newBlockMessageBadId);
    });

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('0 new blocks');
  });
});
