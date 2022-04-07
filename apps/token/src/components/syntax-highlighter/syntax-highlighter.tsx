import React from "react";
import Highlighter from "react-syntax-highlighter";

const vegaJsonTheme = {
  hljs: {
    fontSize: "1rem",
    fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    display: "block",
    overflowX: "auto",
    padding: "1em",
    color: "#26ff8a",
    background: "#2C2C2C",
    border: "1px solid #696969",
  },
  "hljs-literal": {
    color: "#ff2d5e",
  },
  "hljs-number": {
    color: "#ff7a1a",
  },
  "hljs-string": {
    color: "#48aff0",
  },
};


export const SyntaxHighlighter = ({ data }: { data: object }) => {
  return (
    <Highlighter
      language="json"
      style={vegaJsonTheme}
      data-testid="syntax-highlighter"
    >
      {JSON.stringify(data, null, 2)}
    </Highlighter>
  );
};
