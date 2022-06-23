import React from 'react';

import { Nav } from '../nav';

export interface TemplateSidebarProps {
  children: React.ReactNode;
  sidebar: React.ReactNode[];
}

export function TemplateSidebar({ children, sidebar }: TemplateSidebarProps) {
  return (
    <div className="border-b border-white lg:grid lg:grid-rows-[auto_minmax(600px,_1fr)] lg:grid-cols-[1fr_450px]">
      <Nav />
      <main className="p-20">{children}</main>
      <aside className="hidden lg:block lg:col-start-2 lg:col-end-4 lg:row-start-1 lg: row-end-4 p-20 bg-banner bg-contain border-l border-white">
        {sidebar.map((Component, i) => (
          <section className="mb-20 last:mb-0" key={i}>
            {Component}
          </section>
        ))}
      </aside>
    </div>
  );
}
