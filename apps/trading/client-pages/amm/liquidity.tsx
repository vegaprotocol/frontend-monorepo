import { WalletNotConnectedAlert } from '../../components/amm/wallet-not-connected-alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { useAMMs, type AMM } from '@vegaprotocol/rest';

import { createCancelAmmTransaction } from '../../lib/utils/amm';
import { CancelAMMMethod } from '@vegaprotocol/wallet';
import type { ICellRendererParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/use-t';
import { Links } from '../../lib/links';
import { useSimpleTransaction, useWallet } from '@vegaprotocol/wallet-react';
import { TransactionDialog } from '../../components/transaction-dialog/transaction-dialog';

export const Liquidity = () => {
  const [pubKey, status] = useWallet((store) => [store.pubKey, store.status]);
  const isConnected = pubKey && status === 'connected';

  return (
    <>
      <h1 className="text-3xl lg:text-6xl leading-[1em] font-alt calt mb-2 lg:mb-10">
        {t('MY_LIQUIDITY_TITLE')}
      </h1>

      {!isConnected ? (
        <WalletNotConnectedAlert />
      ) : (
        <MyLiquidityList pubKey={pubKey} />
      )}
    </>
  );
};

const MyLiquidityList = ({ pubKey }: { pubKey: string }) => {
  const { data: amms } = useAMMs({ partyId: pubKey });

  return (
    <div className="ag-theme-quartz-auto-dark">
      <AgGridReact
        rowData={amms}
        domLayout="autoHeight"
        suppressDragLeaveHidesColumns
        overlayLoadingTemplate={t('TABLE_LOADING')}
        overlayNoRowsTemplate={t('TABLE_NO_DATA')}
        columnDefs={[
          {
            headerName: t('LIQUIDITY_TABLE_TH_NAME'),
            field: 'market.code',
            flex: 1,
            cellClass: 'cursor-pointer',
          },
          {
            headerName: t('LIQUIDITY_TABLE_TH_ACTIONS'),
            field: 'marketId',
            cellRenderer: ({ value }: ICellRendererParams<AMM, string>) => {
              if (!value) return null;

              return (
                <div className="flex h-full items-center justify-end gap-1">
                  <Link to={Links.AMM_POOL_MANAGE(value)}>
                    <Button variant="outline" size="xs">
                      {t('LIQUIDITY_ACTION_AMEND')}
                    </Button>
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button onClick={undefined} variant="destructive" size="xs">
            {t('LIQUIDITY_ACTION_CANCEL')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('LIQUIDITY_CANCEL_DIALOG_TITLE')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('LIQUIDITY_CANCEL_DIALOG_DESCRIPTION')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('LIQUIDITY_CANCEL_DIALOG_CANCEL')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                sendCancelAmmTx();
                setOpen(true);
              }}
            >
              {t('LIQUIDITY_CANCEL_DIALOG_CONTINUE')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <TransactionDialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
        title={t('LIQUIDITY_CANCEL_TX_DIALOG_TITLE')}
        error={error}
        txStatus={status}
        result={result}
        reset={reset}
      />
    </>
  );
};
