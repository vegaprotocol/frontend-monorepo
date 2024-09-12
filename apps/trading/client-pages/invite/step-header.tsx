import { GradientText } from '../../components/gradient-text';
import { type ReactNode } from 'react';

export const StepHeader = ({ title }: { title: ReactNode }) => (
  <h1 className="text-5xl text-center">
    <GradientText>{title}</GradientText>
  </h1>
);
