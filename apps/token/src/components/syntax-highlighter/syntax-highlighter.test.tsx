import { render, screen } from "@testing-library/react";

import { SyntaxHighlighter } from "./syntax-highlighter";

it("Renders test id and content", () => {
  const data = {};
  render(<SyntaxHighlighter data={data} />);
  expect(screen.getByTestId("syntax-highlighter")).toHaveTextContent(
    JSON.stringify(data, null, 2)
  );
});
