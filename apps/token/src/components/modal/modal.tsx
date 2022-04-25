import "./modal.scss";

import React from "react";

interface ModalProps {
  children: React.ReactNode;
  title: string;
}

export const Modal = ({ children, title }: ModalProps) => (
  <div>
    <h2 className="modal__title">{title}</h2>
    <div className="modal__content">{children}</div>
  </div>
);
