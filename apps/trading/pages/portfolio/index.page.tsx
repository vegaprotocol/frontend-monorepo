import { t } from '@vegaprotocol/react-helpers';
import { GridTab, GridTabs } from '../../components/grid-tabs';

const Portfolio = () => {
  const tabClassName = 'p-[16px] pl-[316px]';

  return (
    <div className="h-full text-ui">
      <main className="relative h-[calc(100%-200px)]">
        <aside className="absolute px-[8px] py-[16px] w-[300px] mt-[28px] h-[calc(100%-28px)] w-[300px] overflow-auto">
          <h2>{t('Filters')}</h2>
        </aside>
        <GridTabs group="portfolio">
          <GridTab id="positions" name={t('Positions')}>
            <div className={tabClassName}>
              <h2>{t('Positions')}</h2>
            </div>
          </GridTab>
          <GridTab id="orders" name={t('Orders')}>
            <div className={tabClassName}>
              <h2>{t('Orders')}</h2>
            </div>
          </GridTab>
          <GridTab id="fills" name={t('Fills')}>
            <div className={tabClassName}>
              <h2>{t('Fills')}</h2>
            </div>
          </GridTab>
          <GridTab id="history" name={t('History')}>
            <div className={tabClassName}>
              <h2>{t('History')}</h2>
            </div>
          </GridTab>
        </GridTabs>
        <section></section>
      </main>
      <section className="fixed bottom-0 left-0 w-full h-[200px]">
        <GridTabs group="collaterals">
          <GridTab id="collateral" name={t('Collateral')}>
            <h2>{t('Collateral')}</h2>
          </GridTab>
          <GridTab id="deposits" name={t('Deposits')}>
            <h2>{t('Deposits')}</h2>
          </GridTab>
          <GridTab id="withdrawals" name={t('Withdrawals')}>
            <h2>{t('Withdrawals')}</h2>
          </GridTab>
        </GridTabs>
      </section>
    </div>
  );
};

Portfolio.getInitialProps = () => ({
  page: 'portfolio',
});

export default Portfolio;
