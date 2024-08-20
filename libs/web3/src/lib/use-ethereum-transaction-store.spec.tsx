import { useEthTransactionStore } from './use-ethereum-transaction-store';
import { EthTxStatus } from './use-ethereum-transaction';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import type { EthStoredTxState } from './use-ethereum-transaction-store';

describe('useEthTransactionStore', () => {
  const txHash = 'txHash';
  const deposit = { txHash } as unknown as NonNullable<
    EthStoredTxState['deposit']
  >;

  const processedTransactionUpdate = {
    status: EthTxStatus.Pending,
    txHash,
  };

  const contract = {} as unknown as CollateralBridge;
  const methodName = 'withdrawAsset';
  const args = ['arg1'];
  const requiredConfirmations = 3;
  const requiresConfirmation = true;
  const asset = undefined;

  it('creates transaction with default values', () => {
    useEthTransactionStore
      .getState()
      .create(
        contract,
        methodName,
        args,
        asset,
        requiredConfirmations,
        requiresConfirmation
      );
    const transaction = useEthTransactionStore.getState().transactions[0];
    expect(transaction?.createdAt).toBeTruthy();
    expect(transaction?.contract).toBe(contract);
    expect(transaction?.methodName).toBe(methodName);
    expect(transaction?.args).toBe(args);
    expect(transaction?.requiredConfirmations).toBe(requiredConfirmations);
    expect(transaction?.requiresConfirmation).toBe(requiresConfirmation);
    expect(transaction?.status).toEqual(EthTxStatus.Default);
    expect(transaction?.confirmations).toEqual(0);
    expect(transaction?.dialogOpen).toEqual(true);
  });
  it('updates transaction by index/id', () => {
    useEthTransactionStore.getState().create(contract, methodName, args);
    useEthTransactionStore.getState().create(contract, methodName, args);
    useEthTransactionStore.getState().create(contract, methodName, args);
    const transaction = useEthTransactionStore.getState().transactions[1];
    useEthTransactionStore
      .getState()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .update(transaction!.id, { status: EthTxStatus.Pending });
    expect(
      useEthTransactionStore.getState().transactions.map((t) => t?.status)
    ).toEqual([EthTxStatus.Default, EthTxStatus.Pending, EthTxStatus.Default]);
  });
  it('sets dialogOpen to false on dismiss', () => {
    useEthTransactionStore.getState().create(contract, methodName, args);
    useEthTransactionStore.getState().dismiss(0);
    expect(
      useEthTransactionStore.getState().transactions[0]?.dialogOpen
    ).toEqual(false);
  });

  it('updates deposit', () => {
    useEthTransactionStore.getState().create(contract, methodName, args);
    useEthTransactionStore.getState().update(0, processedTransactionUpdate);
    useEthTransactionStore.getState().updateDeposit(deposit);
    const transaction = useEthTransactionStore.getState().transactions[0];
    expect(transaction?.deposit).toEqual(deposit);
    expect(transaction?.status).toEqual(EthTxStatus.Confirmed);
  });

  it('deletes transaction', () => {
    useEthTransactionStore.getState().create(contract, methodName, args);
    useEthTransactionStore.getState().create(contract, methodName, args);
    useEthTransactionStore.getState().delete(0);
    expect(useEthTransactionStore.getState().transactions[0]).toBeUndefined();
    expect(
      useEthTransactionStore.getState().transactions[1]
    ).not.toBeUndefined();
  });
});
