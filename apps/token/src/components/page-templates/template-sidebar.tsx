import React from 'react';

import { Nav } from '../nav';

export interface TemplateSidebarProps {
  children: React.ReactNode;
  sidebar: React.ReactNode[];
}

export function TemplateSidebar({ children, sidebar }: TemplateSidebarProps) {
  return (
    <div className="border-b border-white lg:grid lg:grid-rows-[min-content_1fr] lg:grid-cols-[850px_450px]">
      <Nav />
      <main className="col-start-1 p-4">{children}</main>
      <aside className="col-start-2 row-start-1 row-span-2 hidden lg:block p-4 bg-banner bg-contain border-l border-white">
        {sidebar.map((Component, i) => (
          <section className="mb-4 last:mb-0" key={i}>
            {Component}
          </section>
        ))}
      </aside>
    </div>
  );
}
