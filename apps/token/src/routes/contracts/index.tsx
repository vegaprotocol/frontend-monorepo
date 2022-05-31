import { t } from '@vegaprotocol/react-helpers';
import { Link } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../components/heading';
import { ADDRESSES } from '../../config';

const Contracts = () => {
  return (
    <section>
      <Heading title={'Contracts'} />
      <hr />
      {Object.entries(ADDRESSES).map(([key, value]) => (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>{key}:</div>
          <Link
            title={t('View address on Etherscan')}
            href={`${process.env['NX_ETHERSCAN_URL']}/address/${value}`}
          >
            {value as string}
          </Link>
        </div>
      ))}
    </section>
  );
};

export default Contracts;
