import React from 'react';

/**
 * Set the document title
 * @param segments string array of segments. Will be reversed.
 */
export function useDocumentTitle(segments?: string[]) {
  const base = 'Nebula Explorer';
  const split = ' | ';

  React.useEffect(() => {
    const segmentsOrdered = segments?.reverse() || [];

    if (segments && segments.length > 0) {
      document.title = `${segmentsOrdered.join(split)}${split}${base}`;
    } else {
      document.title = base;
    }
  }, [segments]);
}
