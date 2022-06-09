export interface HeadingProps {
  title?: string;
}

export const Heading = ({ title }: HeadingProps) => {
  if (!title) return null;

  return (
    <header className="my-0 mx-auto">
      <h1 className="font-alpha calt text-h3 text-white uppercase mb-4">
        {title}
      </h1>
    </header>
  );
};
