import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useProfileDialogStore } from '../../stores/profile-dialog-store';

export const ProfileDialog = () => {
  const open = useProfileDialogStore((store) => store.open);
  const setOpen = useProfileDialogStore((store) => store.setOpen);
  return (
    <Dialog open={open} onChange={setOpen}>
      <div>Content</div>
    </Dialog>
  );
};
