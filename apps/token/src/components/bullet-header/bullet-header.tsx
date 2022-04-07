import "./bullet-header.scss";

import React from "react";

interface BulletHeaderProps {
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const BulletHeader = ({ tag, children, style }: BulletHeaderProps) => {
  return React.createElement(
    tag,
    { className: "bullet-header", style },
    children
  );
};
