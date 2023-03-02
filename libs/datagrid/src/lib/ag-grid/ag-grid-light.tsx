import type { ReactNode } from 'react';
import colors from 'tailwindcss/colors';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const agGridLightVariables = `
  .ag-theme-balham {
    --ag-background-color: ${colors.white};
    --ag-border-color: ${colors.neutral[300]};
    --ag-header-background-color: ${colors.white};
    --ag-odd-row-background-color: ${colors.white};
    --ag-header-column-separator-color: ${colors.neutral[300]};
    --ag-row-border-color: ${colors.white};
    --ag-row-hover-color: ${colors.neutral[100]};
    --ag-font-size: 12px;
  }

  .ag-theme-balham .ag-root-wrapper {
    border: 0;
  }

  .ag-theme-balham .ag-row {
    border-width: 1px 0;
    border-bottom: 1px solid transparent;
  }

  .ag-theme-balham .ag-react-container {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ag-theme-balham .ag-cell, .ag-theme-balham .ag-full-width-row .ag-cell-wrapper.ag-row-group {    
    line-height: calc(min(var(--ag-line-height, 26px), 26px) - 4px);
  }
`;

export const AgGrid = ({
  children,
  customThemeParams,
}: {
  children: ReactNode;
  customThemeParams?: string;
}) => (
  <>
    <style>{agGridLightVariables}</style>
    {customThemeParams && <style>{customThemeParams}</style>}
    {children}
  </>
);
