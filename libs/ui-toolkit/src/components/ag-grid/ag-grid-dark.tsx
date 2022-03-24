import { ReactElement } from 'react';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

const agGridDarkVariables = `
  .ag-theme-balham-dark {
    --ag-background-color: black;
    --ag-border-color: #494949;
    --ag-header-height: 21px;
    --ag-header-background-color: black;
    --ag-odd-row-background-color: black;
    --ag-row-border-color: black;
    --ag-row-hover-color: #494949;
    --ag-row-height: 21px;
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
