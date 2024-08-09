import { cn } from '@vegaprotocol/ui-toolkit';
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

export const FormGrid = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('w-full flex items-start gap-2', className)}
      {...props}
    />
  );
};

export const FormGridCol = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="flex-1 flex flex-col justify-start first:items-start last:items-end gap-1"
      {...props}
    />
  );
};

export const FieldControls = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div className="flex gap-4 justify-end" {...props} />;
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

export const AdvancedControls = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div className="flex flex-col gap-1.5" {...props} />;
};
