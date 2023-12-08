import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

export const QUSDTooltip = () => {
  const t = useT();
  return (
    <Tooltip
      description={
        <>
          <p className="mb-1">
            {t(
              'qUSD provides a rough USD equivalent of balances across all assets using the value of "Quantum" for that asset'
            )}
          </p>
          {DocsLinks && (
            <ExternalLink href={DocsLinks.QUANTUM}>
              {t('Find out more')}
            </ExternalLink>
          )}
        </>
      }
      underline={true}
    >
      <span>{t('qUSD')}</span>
    </Tooltip>
  );
};
