import "./heading.scss";

export interface HeadingProps {
  title?: string;
}

export const Heading = ({ title }: HeadingProps) => {
  if (!title) return null;

  return (
    <>
      <header className="heading">
        <div className="heading__title-container">
          <h1 className="heading__title">
            {title}
          </h1>
        </div>
      </header>
    </>
  );
};
