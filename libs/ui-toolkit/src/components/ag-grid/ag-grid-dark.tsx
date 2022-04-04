import type { ReactElement } from 'react';
import { theme } from '@vegaprotocol/tailwindcss-config';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

const agGridDarkVariables = `
  .ag-theme-balham-dark {
    --ag-background-color: ${theme.colors.black[100]};
    --ag-border-color: ${theme.colors.white[25]};
    --ag-header-background-color: ${theme.colors.black[100]};
    --ag-odd-row-background-color: ${theme.colors.black[100]};
    --ag-row-border-color:${theme.colors.black[100]};
    --ag-row-hover-color: ${theme.colors.white[25]};
    --ag-font-size: 12px;
  }

  .ag-theme-balham-dark .ag-root-wrapper {
    border: 0;
  }

  .ag-theme-balham-dark .ag-react-container {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ag-theme-balham-dark .ag-header-row {
    font-weight: 400;
  }
`;

export const AgGrid = (props: { children: ReactElement }) => (
  <>
    <style>{agGridDarkVariables}</style>
    {props.children}
  </>
);
