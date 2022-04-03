import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { CreateWithdrawPageContainer } from './create-withdraw-page-container';

const Create = () => {
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
    <div className="max-w-[420px] p-24 mx-auto">
      <h1 className="text-h3 mb-12">Create Withdraw</h1>
      <CreateWithdrawPageContainer assetId={assetId} />
    </div>
  );
};

export default Create;
