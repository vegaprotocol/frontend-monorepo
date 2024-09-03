import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Backdrop } from './backdrop';

export const LayoutFull = (props: {
  backdrop?: number;
  children?: ReactNode;
}) => {
  return (
    <>
      <Backdrop backdrop={props.backdrop} />
      {props.children || <Outlet />}
    </>
  );
};
