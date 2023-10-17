const cellClass = 'px-4 py-2 text-sm font-normal text-left';

export const Th = ({ children }: { children: ReactNode }) => {
  return <th className={cellClass}>{children}</th>;
};

export const Td = ({ children }: { children: ReactNode }) => {
  return <th className={cellClass}>{children}</th>;
};

export const Table = ({ children }: { children: ReactNode }) => {
  return (
    <table className="w-full border border-vega-clight-600 dark:border-vega-cdark-600">
      {children}
    </table>
  );
};

export const THead = ({ children }: { children: ReactNode }) => {
  return (
    <thead className="border-b bg-vega-clight-700 dark:bg-vega-cdark-700 border-vega-clight-600 dark:border-vega-cdark-600">
      {children}
    </thead>
  );
};
