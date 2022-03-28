import BigNumber from 'bignumber.js';

interface DepositLimitsProps {
  limits: {
    min: BigNumber;
    max: BigNumber;
  };
}

export const DepositLimits = ({ limits }: DepositLimitsProps) => {
  const minLimit = limits.min.toString();
  const maxLimit = limits.max.toString();
  return (
    <>
      <p className="text-ui font-bold">Temporary deposit limits</p>
      <table className="w-full text-ui">
        <tbody>
          <tr>
            <th className="text-left font-normal">Minimum</th>
            <td className="text-right">{minLimit}</td>
          </tr>
          <tr>
            <th className="text-left font-normal">Maximum</th>
            <td className="text-right">{maxLimit}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
