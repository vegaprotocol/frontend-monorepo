import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Web3Container } from '../../../components/web3-container';
import { DepositContainer } from './deposit-container';

const Deposit = () => {
  const { query } = useRouter();
  const assetId = useMemo(() => {
    if (query.assetId && Array.isArray(query.assetId)) {
      return undefined;
    }

    if (Array.isArray(query.assetId)) {
      return undefined;
    }

    return query.assetId;
  }, [query]);

  return (
    <Web3Container>
      {({ ethereumConfig }) => (
        <div className="p-24">
          <div className="max-w-[420px]">
            <DepositContainer
              ethereumConfig={ethereumConfig}
              assetId={assetId}
            />
          </div>
        </div>
      )}
    </Web3Container>
  );
};

export default Deposit;
