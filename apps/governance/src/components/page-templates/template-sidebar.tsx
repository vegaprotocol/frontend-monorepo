import { Children, type ReactNode } from 'react';

export interface TemplateSidebarProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function TemplateSidebar({ children, sidebar }: TemplateSidebarProps) {
  return (
    <div className="w-full border-b border-neutral-700 lg:grid lg:grid-rows-[1fr] lg:grid-cols-[1fr_450px]">
      <main className="max-w-[100vw] col-start-1 p-4 overflow-auto">
        {children}
      </main>
      <aside className="col-start-2 row-start-1 row-span-2 hidden lg:block p-4 bg-banner bg-contain border-l border-neutral-700">
        {Children.map(sidebar, (child, i) => (
          <section className="mb-4 last:mb-0" key={i}>
            {child}
          </section>
        ))}
      </aside>
    </div>
  );
}
