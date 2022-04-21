import "./template-sidebar.scss";

import React from "react";

import { Nav } from "../nav";

export interface TemplateSidebarProps {
  children: React.ReactNode;
  sidebar: React.ReactNode[];
}

export function TemplateSidebar({ children, sidebar }: TemplateSidebarProps) {
  return (
    <div className="template-sidebar">
      <Nav />
      <main>{children}</main>
      <aside>
        {sidebar.map((Component, i) => (
          <section key={i}>{Component}</section>
        ))}
      </aside>
    </div>
  );
}
