import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="px-24 py-16 pr-64 border items-center">{children}</div>
  );
}
