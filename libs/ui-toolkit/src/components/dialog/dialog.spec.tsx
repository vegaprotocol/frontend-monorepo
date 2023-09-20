import { useState } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { Dialog } from './dialog';

const QueuedDialogs = () => {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const onChange = (open: boolean) => void 0;
  return (
    <>
      <Dialog
        open={open1}
        dataTestId="dialog1"
        onChange={onChange}
        id="dialog1"
      >
        Dialog 1
      </Dialog>
      <Dialog
        open={open2}
        dataTestId="dialog2"
        onChange={onChange}
        id="dialog2"
      >
        Dialog 2
      </Dialog>
      <Dialog
        open={open3}
        dataTestId="dialog3"
        onChange={onChange}
        id="dialog3"
      >
        Dialog 3
      </Dialog>
      <button onClick={() => setOpen1(!open1)}>Open 1</button>
      <button onClick={() => setOpen2(!open2)}>Open 2</button>
      <button onClick={() => setOpen3(!open3)}>Open 3</button>
    </>
  );
};

describe('Dialog module', () => {
  it('dialogs should be queued', async () => {
    render(<QueuedDialogs />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Open 1'));
    expect(screen.getByTestId('dialog1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Open 2'));
    expect(screen.queryByTestId('dialog1')).not.toBeInTheDocument();
    expect(screen.getByTestId('dialog2')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Open 3'));
    expect(screen.queryByTestId('dialog2')).not.toBeInTheDocument();
    expect(screen.getByTestId('dialog3')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Open 3'));
    expect(screen.queryByTestId('dialog3')).not.toBeInTheDocument();
    expect(screen.getByTestId('dialog2')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Open 2'));
    expect(screen.queryByTestId('dialog2')).not.toBeInTheDocument();
    expect(screen.getByTestId('dialog1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Open 1'));
    expect(screen.queryByTestId('dialog1')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
