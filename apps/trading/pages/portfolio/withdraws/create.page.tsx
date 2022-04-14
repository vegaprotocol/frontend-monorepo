import { Web3Container } from '../../../components/web3-container';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { CreateWithdrawPageContainer } from './create-withdraw-page-container';

const CreateWithdraw = () => {
  const { query } = useRouter();

  // AssetId can be specified in the query string to allow link to deposit a particular asset
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
      {() => (
        <div className="max-w-[420px] p-24 mx-auto">
          <h1 className="text-h3 mb-12">Withdraw</h1>
          <CreateWithdrawPageContainer assetId={assetId} />
        </div>
      )}
    </Web3Container>
  );
};

export default CreateWithdraw;
