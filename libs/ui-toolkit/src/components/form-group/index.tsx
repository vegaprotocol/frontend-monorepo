import { ReactNode } from 'react';

interface FormGroupProps {
  children: ReactNode;
  label: string;
  labelFor: string;
}

export const FormGroup = ({ children, label, labelFor }: FormGroupProps) => {
  return (
    <div className="mb-12">
      {label && (
        <label className="block text-ui" htmlFor={labelFor}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
};
