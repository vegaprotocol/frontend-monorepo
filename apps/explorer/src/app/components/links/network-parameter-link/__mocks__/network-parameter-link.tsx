export const NetworkParameterLink = ({ parameter }: { parameter: string }) => (
  <a href={`/network/#${parameter}`}>{parameter}</a>
);
