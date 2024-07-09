import { type HTMLAttributes } from 'react';

export const Form = (props: HTMLAttributes<HTMLFormElement>) => {
  return (
    <form
      {...props}
      className="flex flex-col gap-4"
      data-testid="deal-ticket-form"
      noValidate
    />
  );
};

export const FormGrid = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} className="grid grid-cols-2 gap-2" />;
};

export const FormGridCol = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className="flex flex-col first:items-start last:items-end gap-1"
    />
  );
};

export const InputLabel = ({
  label,
  symbol,
}: {
  label: string;
  symbol?: string;
}) => {
  return (
    <>
      <span className="text-default">{label}</span> {symbol}
    </>
  );
};
