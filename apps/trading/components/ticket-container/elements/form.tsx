import { HTMLAttributes } from 'react';

export const Form = (props: HTMLAttributes<HTMLFormElement>) => {
  return <form {...props} className="flex flex-col gap-4" />;
};

export const FormGrid = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} className="grid grid-cols-2 gap-2" />;
};

export const FormGridCol = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} className="flex flex-col gap-1" />;
};
