import React from 'react';

interface BulletHeaderProps {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const BulletHeader = ({ tag, children, style }: BulletHeaderProps) => {
  return React.createElement(
    tag,
    {
      className: 'mt-24 py-8 border-t border-white uppercase text-white',
      style,
    },
    <>
      <span className="inline-block w-[12px] h-[12px] mr-12 bg-white" />
      {children}
    </>
  );
};
