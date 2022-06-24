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
  .ag-theme-balham .ag-header-label-icon .ag-icon::before{
    font-size: 10px;
    line-height: 1px;
    position: absolute;
    transform: rotate(90deg);
  }
  .ag-theme-balham .ag-icon-none::before{
    letter-spacing: -2px;
    content: "◀ ▶";
    position: absolute;
    top: 0px;
    right: -18px;
  }
  .ag-theme-balham .ag-icon-desc::before{
    letter-spacing: 1px;
    content: "\\00A0 ▶";
    top: 2px;
    right: -15px;
  }
  .ag-theme-balham .ag-icon-asc::before{
    letter-spacing: -1px;
    content: "◀ \\00A0";
    top: -2px;
    right: -15px;
  }
`;

export const agGridDarkVariables = `
  .ag-theme-balham-dark {
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
  .ag-theme-balham-dark .ag-header-label-icon .ag-icon::before{
    font-size: 10px;
    line-height: 1px;
    position: absolute;
    transform: rotate(90deg);
    color: rgba(245, 245, 245, 0.64);
  }
  .ag-theme-balham-dark .ag-icon-none::before{
    letter-spacing: -2px;
    content: "◀ ▶";
    position: absolute;
    top: 0px;
    right: -18px;
  }
  .ag-theme-balham-dark .ag-icon-desc::before{
    letter-spacing: 1px;
    content: "\\00A0 ▶";
    top: 2px;
    right: -15px;
  }
  .ag-theme-balham-dark .ag-icon-asc::before{
    letter-spacing: -1px;
    content: "◀ \\00A0";
    top: -2px;
    right: -15px;
  }
`;
