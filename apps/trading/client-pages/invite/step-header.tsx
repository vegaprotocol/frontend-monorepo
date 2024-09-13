import { GradientText } from '../../components/gradient-text';
import { type ReactNode } from 'react';

export const StepHeader = ({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) => (
  <header className="flex flex-col justify-center items-center gap-4">
    <h1 className="text-5xl text-center">
      <GradientText>{title}</GradientText>
    </h1>
    {children}
  </header>
);
