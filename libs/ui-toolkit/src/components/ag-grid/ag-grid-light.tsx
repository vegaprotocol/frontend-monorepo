import { ReactElement } from 'react';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const agGridLightVariables = `
  .ag-theme-balham {
    --ag-background-color: white;
    --ag-border-color: #494949;
    --ag-font-size: 12px;
    --ag-header-background-color: white;
    --ag-odd-row-background-color: white;
    --ag-row-border-color: white;
    --ag-row-hover-color: #edff22;  
  }

  .ag-theme-balham .ag-root-wrapper {
    border: 0;
  }

  .ag-theme-balham .ag-react-container {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ag-theme-balham-dark .ag-header-row {
    font-weight: 400;
  }
`;

export const AgGrid = (props: { children: ReactElement }) => (
  <>
    <style>{agGridLightVariables}</style>
    {props.children}
  </>
);
