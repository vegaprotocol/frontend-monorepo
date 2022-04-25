export interface HeadingProps {
  title?: string;
}

export const Heading = ({ title }: HeadingProps) => {
  if (!title) return null;

  return (
    <header className="my-0 mx-auto">
      <h1 className="font-alpha font-normal text-h3 uppercase m-0 mb-4">
        {title}
      </h1>
    </header>
  );
};
