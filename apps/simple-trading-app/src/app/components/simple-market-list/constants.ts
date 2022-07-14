import { t } from '@vegaprotocol/react-helpers';
import { themelite as theme } from '@vegaprotocol/tailwindcss-config';

export const STATES_FILTER = [
  { value: 'all', text: t('All') },
  { value: 'Active', text: t('Active') },
  { value: 'Cancelled', text: t('Cancelled') },
  { value: 'Closed', text: t('Closed') },
  { value: 'Pending', text: t('Pending') },
  { value: 'Proposed', text: t('Proposed') },
  { value: 'Rejected', text: t('Rejected') },
  { value: 'Settled', text: t('Settled') },
  { value: 'Suspended', text: t('Suspended') },
  { value: 'TradingTerminated', text: t('TradingTerminated') },
];

export const agGridLightVariables = `
  .ag-theme-balham {
    --ag-row-border-color: ${theme.colors.transparent};
    --ag-row-hover-color: ${theme.colors.transparent};
    --ag-font-size: 15px;
  }
  .ag-theme-balham .ag-row-hover {
    --ag-row-border-color: ${theme.colors.black[100]};
  }
  .ag-theme-balham [col-id="status"] .ag-header-cell-label,
  .ag-theme-balham [col-id="asset"] .ag-header-cell-label,
  .ag-theme-balham [col-id="change"] .ag-header-cell-label{
    justify-content: center;
  }
  .ag-theme-balham .ag-header-row .ag-header-cell:first-child{
    padding-left: 0;
  }
  .ag-theme-balham .ag-ltr .ag-header-cell::after, .ag-theme-balham .ag-ltr .ag-header-group-cell::after {
    right: 0;
  }
  .ag-theme-balham .ag-header-cell::after{
    width: 0;
  }
  .ag-theme-balham .ag-header{
     border-bottom-width: 0;
  }
  .ag-theme-balham .ag-has-focus .ag-row.ag-row-focus .ag-cell-focus {
    outline: none;
    border-width: 0;
  }
  .ag-theme-balham .ag-header-label-icon .ag-icon{
    position: relative;
  }
  .ag-theme-balham .ag-icon::before{
    font-size: 10px;
    line-height: 12px;
    position: absolute;
    transform: rotate(45deg);
    top: -6px;
    right: -14px;
    content: "◾";
    background: -webkit-linear-gradient(135deg, rgba(0,0,0,0.54) 0%, rgba(0,0,0,0.54) 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.54) 52%, rgba(0,0,0,0.54) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .ag-theme-balham .ag-icon-desc::before{
    background: -webkit-linear-gradient(135deg, #000 0%, #000 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.54) 52%, rgba(0,0,0,0.54) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .ag-theme-balham .ag-icon-asc::before{
    background: -webkit-linear-gradient(135deg, rgba(0,0,0,0.54) 0%, rgba(0,0,0,0.54) 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 52%, #000 52%, #000 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export const agGridDarkVariables = `
  .ag-theme-balham-dark {
    --ag-background-color: ${theme.colors.lite.black};
    --ag-row-border-color: ${theme.colors.transparent};
    --ag-row-hover-color: ${theme.colors.transparent};
    --ag-font-size: 15px;
  }
  .ag-theme-balham-dark .ag-row-hover {
    --ag-row-border-color: ${theme.colors.white[100]};
  }
  .ag-theme-balham-dark [col-id="status"] .ag-header-cell-label,
  .ag-theme-balham-dark [col-id="asset"] .ag-header-cell-label,
  .ag-theme-balham-dark [col-id="change"] .ag-header-cell-label{
    justify-content: center;
  }
  .ag-theme-balham-dark .ag-header-row .ag-header-cell:first-child{
    padding-left: 0;
  }
  .ag-theme-balham-dark .ag-header-cell::after{
    width: 0;
  }
  .ag-theme-balham-dark .ag-header{
     border-bottom-width: 0;
  }
  .ag-theme-balham-dark .ag-has-focus .ag-row.ag-row-focus .ag-cell-focus {
    outline: none;
    border-width: 0;
  }
  .ag-theme-balham-dark .ag-header-label-icon .ag-icon{
    position: relative;
  }
  .ag-theme-balham-dark .ag-icon::before{
    font-size: 10px;
    line-height: 12px;
    position: absolute;
    transform: rotate(45deg);
    top: -6px;
    right: -14px;
    content: "◾";
    background: -webkit-linear-gradient(135deg, rgba(245, 245, 245, 0.64) 0%, rgba(245, 245, 245, 0.64) 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 52%, rgba(245, 245, 245, 0.64) 52%, rgba(245, 245, 245, 0.64) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-position: center;
  }
  .ag-theme-balham-dark .ag-icon-desc::before{
    background: -webkit-linear-gradient(135deg, #fff 0%, #fff 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 52%, rgba(245, 245, 245, 0.64) 52%, rgba(245, 245, 245, 0.64) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .ag-theme-balham-dark .ag-icon-asc::before{
    background: -webkit-linear-gradient(135deg, rgba(245, 245, 245, 0.64) 0%, rgba(245, 245, 245, 0.64) 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 52%, #fff 52%, #fff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;
