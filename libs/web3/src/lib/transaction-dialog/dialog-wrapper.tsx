import type { ReactNode } from 'react';

interface DialogWrapperProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

export const DialogWrapper = ({
  children,
  icon,
  title,
}: DialogWrapperProps) => {
  return (
    <div className="flex gap-12 max-w-full text-ui">
      <div className="pt-8 fill-current">{icon}</div>
      <div className="flex-1">
        <h1 className="text-h4 text-black dark:text-white mb-12">{title}</h1>
        <div className="text-black-40 dark:text-white-40">{children}</div>
      </div>
    </div>
  );
};
