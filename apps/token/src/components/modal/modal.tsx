import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  title: string;
}

export const Modal = ({ children, title }: ModalProps) => (
  <div className="relative top-0 left-[calc(50vw-200px)] w-[400px] my-[10vh] mx-0 bg-white text-black z-30">
    <h2 className="text-center py-12">{title}</h2>
    <div className="pt-0 px-20 pb-20">{children}</div>
  </div>
);
