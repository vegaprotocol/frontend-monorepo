import { Outlet } from 'react-router-dom';

export const InviteRoot = () => {
  return (
    <div className="flex flex-col gap-6">
      <Outlet />
    </div>
  );
};
