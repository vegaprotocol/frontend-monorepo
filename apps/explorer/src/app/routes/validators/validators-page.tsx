import {
  ContractAddressLink,
  countryCodeToFlagEmoji,
  t,
} from '@vegaprotocol/react-helpers';
import {
  AsyncRenderer,
  Button,
  CopyWithTooltip,
  ExternalLink,
  Icon,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';

import { useExplorerNodesQuery } from './__generated__/Nodes';
import { useDocumentTitle } from '../../hooks/use-document-title';
import compact from 'lodash/compact';
import { useTendermintValidators } from '../../hooks/use-tendermint-validators';
import { useState } from 'react';
import { JsonViewerDialog } from '../../components/dialogs/json-viewer-dialog';
import { PageTitle } from '../../components/page-helpers/page-title';

export const ValidatorsPage = () => {
  useDocumentTitle(['Validators']);

  const { data: tmData, loading: tmLoading } = useTendermintValidators();
  const { data, loading, error, refetch } = useExplorerNodesQuery();
  const validators = compact(data?.nodesConnection.edges?.map((e) => e?.node));

  const [vegaDialog, setVegaDialog] = useState<boolean>(false);
  const [tmDialog, setTmDialog] = useState<boolean>(false);
  return (
    <>
      <section>
        <PageTitle
          title={t('Validators')}
          actions={
            <>
              <Button
                disabled={Boolean(!data)}
                size="xs"
                onClick={() => setVegaDialog(true)}
              >
                {t('View JSON')}
              </Button>
              {
                <Button
                  disabled={Boolean(!tmData)}
                  size="xs"
                  onClick={() => setTmDialog(true)}
                >
                  {t('View tendermint as JSON')}
                </Button>
              }
            </>
          }
        />
        <AsyncRenderer
          data={validators}
          loading={Boolean(loading && tmLoading)}
          error={error}
          reload={refetch}
        >
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validators.map((v) => {
              const tm = tmData?.result.validators.find(
                (tmv) => tmv.pub_key.value === v.tmPubkey
              );
              return (
                <li className="" key={v.id}>
                  <div className="border rounded p-2 overflow-hidden relative flex gap-2">
                    {v.avatarUrl && (
                      <div className="w-20">
                        <ExternalLink href={v.infoUrl}>
                          <img src={v.avatarUrl} alt={v.name} />
                        </ExternalLink>
                      </div>
                    )}
                    <div>
                      <h2 className="font-alpha text-2xl">
                        <ExternalLink href={v.infoUrl}>{v.name}</ExternalLink>
                      </h2>
                      <KeyValueTable>
                        <KeyValueTableRow>
                          <div>{t('ID')}</div>
                          <div className="break-all">{v.id}</div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Location')}</div>
                          <div>
                            {countryCodeToFlagEmoji(v.location)}{' '}
                            <span className="text-[10px]">{v.location}</span>
                          </div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Public key')}</div>
                          <div className="break-all">{v.pubkey}</div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Ethereum address')}</div>
                          <div className="break-all">
                            <ContractAddressLink address={v.ethereumAddress} />{' '}
                            <CopyWithTooltip text={v.ethereumAddress}>
                              <button title={t('Copy address to clipboard')}>
                                <Icon size={3} name="duplicate" />
                              </button>
                            </CopyWithTooltip>
                          </div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Tendermint public key')}</div>
                          <div className="break-all">{v.tmPubkey}</div>
                        </KeyValueTableRow>
                        {tm && (
                          <>
                            <KeyValueTableRow>
                              <div>{t('Voting power')}</div>
                              <div>{tm?.voting_power}</div>
                            </KeyValueTableRow>
                            <KeyValueTableRow>
                              <div>{t('Proposer priority')}</div>
                              <div>{tm?.proposer_priority}</div>
                            </KeyValueTableRow>
                          </>
                        )}
                        <KeyValueTableRow>
                          <div>{t('Staked')}</div>
                          <div></div>
                        </KeyValueTableRow>
                      </KeyValueTable>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </AsyncRenderer>
      </section>
      <JsonViewerDialog
        open={vegaDialog}
        onChange={(isOpen) => setVegaDialog(isOpen)}
        title={t('Vega Validators')}
        content={data}
      />
      <JsonViewerDialog
        open={tmDialog}
        onChange={(isOpen) => setTmDialog(isOpen)}
        title={t('Tendermint Validators')}
        content={tmData}
      />
    </>
  );
};
