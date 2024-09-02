import { WalletNotConnectedAlert } from '../../components/amm/wallet-not-connected-alert';
import { useAMMs, type AMM } from '@vegaprotocol/rest';
import { createCancelAmmTransaction } from '../../lib/utils/amm';
import { CancelAMMMethod } from '@vegaprotocol/wallet';
import type { ICellRendererParams } from 'ag-grid-community';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';
import { useSimpleTransaction, useWallet } from '@vegaprotocol/wallet-react';
import { TransactionDialog } from '../../components/transaction-dialog/transaction-dialog';
import { AgGrid } from '@vegaprotocol/datagrid';
import { HeaderPage } from '../../components/header-page';
import { Button, Dialog, Intent } from '@vegaprotocol/ui-toolkit';

export const Liquidity = () => {
  const t = useT();
  const [pubKey, status] = useWallet((store) => [store.pubKey, store.status]);
  const isConnected = pubKey && status === 'connected';

  return (
    <>
      <HeaderPage>{t('AMM_MY_LIQUIDITY_TITLE')}</HeaderPage>

      {!isConnected ? (
        <WalletNotConnectedAlert />
      ) : (
        <MyLiquidityList pubKey={pubKey} />
      )}
    </>
  );
};

const MyLiquidityList = ({ pubKey }: { pubKey: string }) => {
  const t = useT();
  const { data: amms } = useAMMs({ partyId: pubKey });

  return (
    <div className="h-full border rounded border-gs-300 dark:border-gs-700">
      <AgGrid
        rowData={amms}
        rowClass={
          '!border-b !last:border-b-0 mb-1 border-gs-200 dark:border-gs-800'
        }
        domLayout="autoHeight"
        suppressDragLeaveHidesColumns
        overlayLoadingTemplate={t('AMM_TABLE_LOADING')}
        overlayNoRowsTemplate={t('AMM_TABLE_NO_DATA')}
        columnDefs={[
          {
            headerName: t('AMM_LIQUIDITY_TABLE_TH_NAME'),
            field: 'market.code',
            flex: 1,
            cellClass: 'cursor-pointer',
          },
          {
            headerName: t('AMM_LIQUIDITY_TABLE_TH_ACTIONS'),
            field: 'marketId',
            cellRenderer: ({ value }: ICellRendererParams<AMM, string>) => {
              if (!value) return null;

              return (
                <div className="flex h-full items-center justify-end gap-1">
                  <Link to={Links.AMM_POOL_MANAGE(value)}>
                    <Button size="xs">{t('AMM_LIQUIDITY_ACTION_AMEND')}</Button>
                  </Link>
                  <CancelLiquidityButton marketId={value} />
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
};

const CancelLiquidityButton = ({ marketId }: { marketId: string }) => {
  const t = useT();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const { error, send, result, status, reset } = useSimpleTransaction();

  const sendCancelAmmTx = () => {
    const tx = createCancelAmmTransaction(
      marketId,
      CancelAMMMethod.METHOD_IMMEDIATE
    );
    send(tx);
  };

  return (
    <>
      <Button
        onClick={() => {
          setOpenConfirm(true);
        }}
        intent={Intent.Danger}
        size="xs"
      >
        {t('AMM_LIQUIDITY_ACTION_CANCEL')}
      </Button>

      <Dialog
        title={t('AMM_LIQUIDITY_CANCEL_DIALOG_TITLE')}
        open={openConfirm}
        onChange={(open) => setOpenConfirm(open)}
      >
        <div className="flex flex-col gap-2">
          <p>{t('AMM_LIQUIDITY_CANCEL_DIALOG_DESCRIPTION')}</p>
          <div className="flex gap-1 justify-end">
            <Button
              onClick={() => {
                setOpenConfirm(false);
              }}
            >
              {t('AMM_LIQUIDITY_CANCEL_DIALOG_CANCEL')}
            </Button>
            <Button
              intent={Intent.Danger}
              onClick={() => {
                sendCancelAmmTx();
                setOpenConfirm(false);
                setOpen(true);
              }}
            >
              {t('AMM_LIQUIDITY_CANCEL_DIALOG_CONTINUE')}
            </Button>
          </div>
        </div>
      </Dialog>

      <TransactionDialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
        title={t('AMM_LIQUIDITY_CANCEL_TX_DIALOG_TITLE')}
        error={error}
        txStatus={status}
        result={result}
        reset={() => {
          setOpen(false);
          reset();
        }}
      />
    </>
  );
};
