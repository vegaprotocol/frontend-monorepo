import { useTranslation } from 'react-i18next';
import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/react-helpers';
import { Heading } from '../../components/heading';
import { ADDRESSES } from '../../config';

const Contracts = () => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  return (
    <section>
      <Heading title={'Contracts'} />
      <hr />
      {Object.entries(ADDRESSES).map(([key, value]) => (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>{key}:</div>
          <Link
            title={t('View address on Etherscan')}
            href={`${ETHERSCAN_URL}/address/${value}`}
          >
            {value}
          </Link>
        </div>
      ))}
    </section>
  );
};

export default Contracts;
