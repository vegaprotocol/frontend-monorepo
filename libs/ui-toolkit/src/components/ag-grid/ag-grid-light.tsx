import type { ReactNode } from 'react';
import colors from 'tailwindcss/colors';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const agGridLightVariables = `
  .ag-theme-balham {
    --ag-background-color: ${colors};
    --ag-border-color: ${colors.neutral[200]};
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

  .ag-theme-balham .ag-react-container {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  div[data-testid="tab-positions"] .ag-theme-balham .ag-cell {
    line-height: normal;
  }

  .ag-theme-balham .ag-floating-bottom-container {
    --ag-row-hover-color: none;
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
