import { Time } from '../time';
import { useExplorerWithdrawalQuery } from './__generated__/Withdrawal';

interface TxsStatsInfoProps {
  id: string;
  txStatus: number;
  className?: string;
}

const classes = {
  indicatorFailed:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-red-600 bg-red-600 text-center text-white font-bold leading-5',
  textFailed:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-red-600',
  indicatorComplete:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-vega-green-dark bg-vega-green-dark text-center text-white leading-5',
  textComplete:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-vega-green-dark',
  indicatorIncomplete:
    'rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-gray-300 text-center leading-5',
  textIncomplete:
    'absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase text-gray-500',
};
export const WithdrawalProgress = ({ id, txStatus }: TxsStatsInfoProps) => {
  const { data } = useExplorerWithdrawalQuery({ variables: { id } });

  const step2Date = data?.withdrawal?.createdTimestamp || undefined;
  const step3Date = data?.withdrawal?.withdrawnTimestamp || undefined;

  return (
    <div className="p-5 mb-12 max-w-xl">
      <div className="mx-4 p-4">
        <div className="flex items-center">
          <div className="flex items-center relative">
            <div
              className={
                txStatus === 0
                  ? classes.indicatorComplete
                  : classes.indicatorFailed
              }
            >
              {txStatus === 0 ? 1 : '✕'}
            </div>
            <div
              className={
                txStatus === 0 ? classes.textComplete : classes.textFailed
              }
            >
              Requested
              <br />
            </div>
          </div>
          <div
            className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
              step2Date ? 'border-vega-green-dark' : 'border-gray-300'
            }`}
          ></div>
          <div className="flex items-center relative">
            <div
              className={
                step2Date
                  ? classes.indicatorComplete
                  : classes.indicatorIncomplete
              }
            >
              2
            </div>
            <div
              className={
                step2Date ? classes.textComplete : classes.textIncomplete
              }
            >
              {step2Date ? 'Prepared' : 'Not prepared'}
              <br />
              {step2Date ? <Time date={step2Date} /> : null}
            </div>
          </div>
          <div
            className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
              step3Date ? 'border-vega-green-dark' : 'border-gray-300'
            }`}
          ></div>
          <div className="flex items-center relative">
            <div
              className={
                step3Date
                  ? classes.indicatorComplete
                  : classes.indicatorIncomplete
              }
            >
              3
            </div>
            <div
              className={
                step3Date ? classes.textComplete : classes.textIncomplete
              }
            >
              {step3Date ? 'Complete' : 'Not complete'}
              <br />
              {step3Date ? <Time date={step3Date} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
