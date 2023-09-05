import { countryCodeToFlagEmoji } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  AsyncRenderer,
  Button,
  CopyWithTooltip,
  ExternalLink,
  Icon,
  KeyValueTable,
  KeyValueTableRow,
  Tooltip,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';

import { useExplorerNodesQuery } from './__generated__/Nodes';
import { useDocumentTitle } from '../../hooks/use-document-title';
import compact from 'lodash/compact';
import { useTendermintValidators } from '../../hooks/use-tendermint-validators';
import { useMemo, useState } from 'react';
import { JsonViewerDialog } from '../../components/dialogs/json-viewer-dialog';
import { PageTitle } from '../../components/page-helpers/page-title';
import BigNumber from 'bignumber.js';
import {
  EtherscanLink,
  DApp,
  TOKEN_VALIDATOR,
  useLinks,
} from '@vegaprotocol/environment';
import classNames from 'classnames';
import { NodeStatus, NodeStatusMapping } from '@vegaprotocol/types';
import { PartyLink } from '../../components/links';

type RateProps = {
  value: BigNumber | number | undefined;
  className?: string;
  colour?: 'green' | 'blue' | 'pink' | 'orange';
  asPoint?: boolean;
  zero?: boolean;
};
const Rate = ({
  value,
  className,
  colour = 'blue',
  asPoint = false,
}: RateProps) => {
  const val =
    typeof value === 'undefined'
      ? new BigNumber(0)
      : typeof value === 'number'
      ? new BigNumber(value)
      : value;
  const bar = asPoint
    ? {
        right: `${val.times(100).toFixed(2)}%`,
      }
    : { width: `${val.times(100).toFixed(2)}%` };
  return (
    <div
      className={classNames(
        'overflow-hidden rounded h-[9px] flex w-full bg-vega-light-100 dark:bg-vega-dark-150',
        { 'pl-[9px]': asPoint },
        {
          'bg-gradient-to-l to-vega-orange-500 dark:to-vega-orange-550 from-vega-light-100 dark:from-vega-dark-150':
            asPoint && colour === 'orange',
        }
      )}
    >
      <div className="relative w-full">
        <div
          className={classNames(
            'w-[9px] h-[9px] absolute top-0 right-0 transition-all rounded',
            {
              'bg-vega-green-550 dark:bg-vega-green-500': colour === 'green',
              'bg-vega-blue-550 dark:bg-vega-blue-500': colour === 'blue',
              'bg-vega-pink-550 dark:bg-vega-pink-500': colour === 'pink',
              'bg-vega-orange-550 dark:bg-vega-orange-500': colour === 'orange',
            },
            'bg-vega',
            className
          )}
          style={bar}
        ></div>
      </div>
    </div>
  );
};

export const ValidatorsPage = () => {
  useDocumentTitle(['Validators']);

  const { data: tmData } = useTendermintValidators(5000);
  const { data, loading, error, refetch } = useExplorerNodesQuery();

  const validators = compact(data?.nodesConnection.edges?.map((e) => e?.node));

  // voting power
  const powers = compact(tmData?.result.validators).map(
    (v) => new BigNumber(v.voting_power)
  );
  const totalVotingPower = BigNumber.sum(...powers);

  // proposer priority
  const priorities = compact(tmData?.result.validators).map(
    (v) => new BigNumber(v.proposer_priority)
  );
  const absoluteProposerPriority = BigNumber.max(
    ...priorities.map((p) => p.abs())
  );

  const tmValidators = useMemo(() => {
    return tmData?.result.validators.map((v) => {
      const data = {
        key: v.pub_key.value,
        votingPower: new BigNumber(v.voting_power),
        proposerPriority: new BigNumber(v.proposer_priority),
      };
      return {
        ...data,
        votingPowerRatio: data.votingPower.dividedBy(totalVotingPower),
        proposerPriorityRatio: absoluteProposerPriority
          .plus(data.proposerPriority)
          .dividedBy(absoluteProposerPriority.times(2)),
      };
    });
  }, [tmData?.result.validators, totalVotingPower, absoluteProposerPriority]);

  const totalStaked = BigNumber.sum(
    ...validators.map((v) => new BigNumber(v.stakedTotal))
  );

  const [vegaDialog, setVegaDialog] = useState<boolean>(false);
  const [tmDialog, setTmDialog] = useState<boolean>(false);

  const tokenLink = useLinks(DApp.Token);

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
          loading={loading}
          error={error}
          reload={refetch}
        >
          <ul className="md:columns-2">
            {validators.map((v) => {
              const tm = tmValidators?.find((tmv) => tmv.key === v.tmPubkey);
              const stakedRatio = new BigNumber(v.stakedTotal).dividedBy(
                totalStaked
              );
              const validatorPage = tokenLink(
                TOKEN_VALIDATOR.replace(':id', v.id)
              );
              const validatorName =
                v.name && v.name.length > 0 ? v.name : truncateMiddle(v.id);
              return (
                <li className="mb-5 relative" key={v.id}>
                  <div
                    data-testid="validator-tile"
                    validator-id={v.id}
                    className="border border-vega-light-200 dark:border-vega-dark-200 rounded p-2 overflow-hidden"
                  >
                    <div className="w-full">
                      <h2 className="font-alpha text-2xl leading-[60px]">
                        <ExternalLink href={validatorPage}>
                          {validatorName}
                        </ExternalLink>
                      </h2>
                      <KeyValueTable>
                        <KeyValueTableRow>
                          <div>{t('ID')}</div>
                          <div className="break-all text-xs font-mono">
                            {v.id}
                          </div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Status')}</div>
                          <div className="break-all text-xs">
                            <span
                              className={classNames('mr-1', {
                                'text-vega-green-550 dark:vega-green-500':
                                  v.status === NodeStatus.NODE_STATUS_VALIDATOR,
                                'text-vega-pink-550 dark:vega-pink-500':
                                  v.status ===
                                  NodeStatus.NODE_STATUS_NON_VALIDATOR,
                              })}
                            >
                              <Icon name="tick-circle" size={3} />
                            </span>
                            {NodeStatusMapping[v.status]}
                          </div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Location')}</div>
                          <div>
                            {countryCodeToFlagEmoji(v.location)}{' '}
                            <span className="text-[10px]">{v.location}</span>
                          </div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Key')}</div>
                          <div className="break-all text-xs">
                            <PartyLink id={v.pubkey} />
                          </div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Ethereum address')}</div>
                          <div className="break-all text-xs font-mono">
                            <EtherscanLink address={v.ethereumAddress} />{' '}
                            <CopyWithTooltip text={v.ethereumAddress}>
                              <button title={t('Copy address to clipboard')}>
                                <Icon size={3} name="duplicate" />
                              </button>
                            </CopyWithTooltip>
                          </div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Tendermint public key')}</div>
                          <div className="break-all text-xs font-mono">
                            {v.tmPubkey}
                          </div>
                        </KeyValueTableRow>

                        <KeyValueTableRow>
                          <div>{t('Voting power')}</div>
                          <div className="w-44 text-right">
                            <Rate value={tm?.votingPowerRatio} />
                            <div className="text-[10px] leading-3">
                              {tm?.votingPowerRatio.times(100).toFixed(2)}
                              {'% '}({tm?.votingPower.toString()})
                            </div>
                          </div>
                        </KeyValueTableRow>
                        <KeyValueTableRow>
                          <div>{t('Proposer priority')}</div>
                          <div className="w-44 text-right">
                            <Rate
                              value={tm?.proposerPriorityRatio}
                              colour="orange"
                              asPoint={true}
                              zero={true}
                            />
                            <div className="text-[10px] leading-3">
                              {tm?.proposerPriority.toString()}
                            </div>
                          </div>
                        </KeyValueTableRow>

                        <KeyValueTableRow>
                          <div>{t('Stake share')}</div>
                          <div className="w-44 text-right">
                            <Rate value={stakedRatio} colour="green" />
                            <div className="text-[10px] leading-3">
                              <Tooltip
                                description={
                                  <KeyValueTable
                                    numerical={true}
                                    className="mb-1"
                                  >
                                    <KeyValueTableRow
                                      className="text-xs"
                                      noBorder={true}
                                    >
                                      <div>{t('Staked by operator')}</div>
                                      <div>{v.stakedByOperator}</div>
                                    </KeyValueTableRow>
                                    <KeyValueTableRow
                                      className="text-xs"
                                      noBorder={true}
                                    >
                                      <div>{t('Staked by delegates')}</div>
                                      <div>{v.stakedByDelegates}</div>
                                    </KeyValueTableRow>
                                    <KeyValueTableRow
                                      className="text-xs"
                                      noBorder={true}
                                    >
                                      <div>{t('Staked (total)')}</div>
                                      <div>{v.stakedTotal}</div>
                                    </KeyValueTableRow>
                                  </KeyValueTable>
                                }
                              >
                                <span>
                                  {stakedRatio.times(100).toFixed(2)}%
                                </span>
                              </Tooltip>
                            </div>
                          </div>
                        </KeyValueTableRow>
                        {v.avatarUrl && (
                          <KeyValueTableRow>
                            <div>{t('Avatar')}</div>
                            <div>
                              <ExternalLink
                                href={validatorPage}
                                className="mx-auto"
                              >
                                <img
                                  className="max-w-[75px] md:max-w-[200px] max-h-[80px]"
                                  src={v.avatarUrl}
                                  alt={validatorName}
                                />
                              </ExternalLink>
                            </div>
                          </KeyValueTableRow>
                        )}
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
