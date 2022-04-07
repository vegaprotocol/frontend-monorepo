import React from "react";

export function useDocumentTitle(name?: string) {
  const base = "VEGA token";

  React.useEffect(() => {
    if (name) {
      document.title = `${base} | ${name}`;
    } else {
      document.title = base;
    }
  }, [name]);
}
