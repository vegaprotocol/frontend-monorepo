export interface HeadingProps {
  title?: string;
}

export const Heading = ({ title }: HeadingProps) => {
  if (!title) return null;

  return (
    <header className="my-0 mx-auto">
      <h1 className="calt">{title}</h1>
    </header>
  );
};
