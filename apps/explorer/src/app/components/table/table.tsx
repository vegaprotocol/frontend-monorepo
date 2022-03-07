import React from 'react';

interface TableProps {
  children: React.ReactNode;
}

export const Table = ({ children }: TableProps) => {
  return (
    <div className="overflow-x-auto whitespace-nowrap mb-28">
      <table className="w-full">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};
