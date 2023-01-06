export type EmptyListProps = {
  heading?: string;
  label?: string;
};

/**
 * Renders the empty state from github ticket #1463
 */
const EmptyList = ({ heading, label }: EmptyListProps) => {
  return (
    <div
      className="empty-list w-full items-center h-full align-center"
      data-testid="emptylist"
    >
      <div className="skeleton-list border-dashed border-neutral-800 rounded p-5 w-full border-[1px] grid gap-4 grid-cols-9 grid-rows-1 place-content-around mb-4">
        <div className="bg-neutral-900 mr-5 h-3 col-span-5"></div>
        <div className="bg-neutral-900 h-3 col-span-1"></div>
      </div>

      <div className="mt-4">
        {heading ? (
          <h1 className="font-alpha text-xl uppercase text-center leading-relaxed">
            {heading}
          </h1>
        ) : null}
        {label ? (
          <p className="font-alpha text-gray-500 text-center">{label}</p>
        ) : null}
      </div>
    </div>
  );
};

export default EmptyList;
