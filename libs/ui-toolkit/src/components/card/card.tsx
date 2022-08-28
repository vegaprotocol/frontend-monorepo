import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="px-4 py-2 border border-black dark:border-white items-center">
      {children}
    </div>
  );
}
