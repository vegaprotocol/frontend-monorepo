import "./form-group.scss";

import React from "react";

export const FormGroup = ({
  children,
  label,
  labelFor,
}: {
  children: React.ReactNode;
  label: string;
  labelFor: string;
}) => {
  return (
    <div className="form-group">
      <label htmlFor={labelFor}>{label}</label>
      <div>{children}</div>
    </div>
  );
};
