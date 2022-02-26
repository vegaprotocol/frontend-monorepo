import { useEffect } from 'react';
import Prism from 'prismjs';

interface CodeblockProps {
  code: string;
  language: string;
}

export const Codeblock = ({ code, language }: CodeblockProps) => {
  useEffect(() => {
    Prism.highlightAll();
  });

  return (
    <pre>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};
