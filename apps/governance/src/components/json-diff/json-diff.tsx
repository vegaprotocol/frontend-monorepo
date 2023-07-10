import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatters, create } from 'jsondiffpatch';
import 'jsondiffpatch/dist/formatters-styles/html.css';
import 'jsondiffpatch/dist/formatters-styles/annotated.css';

interface JsonDiffProps {
  // These have to be unknown, as the purpose of this component is to compare
  // two objects which may have different shapes.
  left: unknown;
  right: unknown;
  objectHash?: (obj: unknown) => string | undefined;
}

export const JsonDiff = ({ right, left, objectHash }: JsonDiffProps) => {
  const { t } = useTranslation();
  const [html, setHtml] = useState<string | undefined>();

  useEffect(() => {
    const delta = create({
      objectHash,
    }).diff(left, right);

    if (delta) {
      const deltaHtml = formatters.html.format(delta, left);

      formatters.html.hideUnchanged();

      setHtml(deltaHtml);
    } else {
      setHtml(undefined);
    }
  }, [right, left, objectHash]);

  return html ? (
    <div data-testid="json-diff" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <p data-testid="json-diff">{t('dataIsIdentical')}</p>
  );
};
