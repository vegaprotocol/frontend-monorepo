import type { ReactNode } from 'react';
import colors from 'tailwindcss/colors';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

const agGridDarkVariables = `
  .ag-theme-balham-dark {
    --ag-background-color: ${colors.black};
    --ag-border-color: ${colors.neutral[700]};
    --ag-header-background-color: ${colors.black};
    --ag-odd-row-background-color: ${colors.black};
    --ag-row-border-color:${colors.black};
    --ag-row-hover-color: ${colors.neutral[700]};
    --ag-font-size: 12px;
  }

  .ag-theme-balham-dark .ag-root-wrapper {
    border: 0;
  }

  .ag-theme-balham-dark .ag-react-container {
    overflow: hidden;
    text-overflow: ellipsis;
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
    <style>{agGridDarkVariables}</style>
    {customThemeParams && <style>{customThemeParams}</style>}
    {children}
  </>
);
