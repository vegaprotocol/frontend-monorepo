import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Backdrop } from './backdrop';

export const LayoutCentered = (props: {
  backdrop?: number;
  children?: ReactNode;
}) => {
  return (
    <div className="overflow-y-auto h-full relative">
      <Backdrop backdrop={props.backdrop} />
      <div className="flex flex-col gap-6 container min-h-full max-w-screen-xl mx-auto py-12 px-4">
        {props.children || <Outlet />}
      </div>
    </div>
  );
};
