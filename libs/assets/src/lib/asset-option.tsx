import { Option } from '@vegaprotocol/ui-toolkit';
import type { AssetFieldsFragment } from './__generated__/Asset';

export const AssetOption = ({ asset }: { asset: AssetFieldsFragment }) => {
  return (
    <Option key={asset.id} value={asset.id}>
      <div className="flex flex-col items-start">
        <span>{asset.name}</span>
        <div className="text-[10px] font-mono w-full text-left break-all">
          <span className="text-gray-500">{asset.id} -</span> {asset.symbol}
        </div>
      </div>
    </Option>
  );
};
