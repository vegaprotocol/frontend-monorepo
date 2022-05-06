import WS from 'jest-websocket-mock';
import useWebSocket from 'react-use-websocket';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { TendermintWebsocketContext } from '../../contexts/websocket/tendermint-websocket-context';
import { BlocksRefetch } from './blocks-refetch';

const mocketLocation = 'wss:localhost:3002';

const BlocksRefetchInWebsocketProvider = ({
  callback,
}: {
  callback: () => null;
}) => {
  const contextShape = useWebSocket(mocketLocation);

  return (
    <TendermintWebsocketContext.Provider value={{ ...contextShape }}>
      <BlocksRefetch refetch={callback} />
    </TendermintWebsocketContext.Provider>
  );
};

describe('Blocks refetch', () => {
  const mocket = new WS(mocketLocation);

  it('should render inner components', async () => {
    render(<BlocksRefetchInWebsocketProvider callback={() => null} />);
    await mocket.connected;
    expect(screen.getByTestId('new-blocks')).toHaveTextContent('new blocks');
    expect(screen.getByTestId('refresh')).toBeInTheDocument();
  });

  it('should initiate callback when the button is clicked', async () => {
    const callback = jest.fn();
    render(<BlocksRefetchInWebsocketProvider callback={callback} />);
    await mocket.connected;
    const button = screen.getByTestId('refresh');

    act(() => {
      fireEvent.click(button);
    });

    expect(callback.mock.calls.length).toEqual(1);
  });

  it('should show new blocks as websocket is updated', async () => {
    render(<BlocksRefetchInWebsocketProvider callback={() => null} />);
    await mocket.connected;
    await waitFor(() => expect(mocket.messages.length).toEqual(1));
    console.log(
      `mocket messages length now ${mocket.messages.length}, last message was ${
        mocket.messages[mocket.messages.length - 1]
      }`
    );
    // @ts-ignore asdfasdfasdf
    const id = JSON.parse(mocket.messages[0]).id;

    const update = JSON.stringify({
      jsonrpc: '2.0',
      id,
      result: {
        query: "tm.event = 'NewBlock'",
        data: {
          type: 'tendermint/event/NewBlock',
          value: {
            block: {
              header: {
                version: {
                  block: '11',
                },
                chain_id: 'vega-mainnet-0006',
                height: '4784310',
                time: '2022-05-05T10:32:08.963094284Z',
                last_block_id: {
                  hash: 'AA4C36661992B881273F475C1B776464A9CD74F90382229180572890821D1EFE',
                  parts: {
                    total: 1,
                    hash: '54E0DE11E48B1CACA50982BC35DFF3F8ADF2537FE46339BBCFEAD7B3F4C73A4A',
                  },
                },
                last_commit_hash:
                  'A50AB205AF312AE818C35B1F6749D615A6C3282D8B74DB15E7310A5DEFBB1D0A',
                data_hash:
                  'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
                validators_hash:
                  'B0C7DC12204271732DDA4DB0D9D41ED645FE20344E6E4A448D2FE79E82292A48',
                next_validators_hash:
                  'B0C7DC12204271732DDA4DB0D9D41ED645FE20344E6E4A448D2FE79E82292A48',
                consensus_hash:
                  '048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F',
                app_hash:
                  'A7FFC6F8BF1ED76651C14756A061D662F580FF4DE43B49FA82D80A4B80F8434A2A533DEFDB1990B270756B4AE01910785EBBDAD43AE04A5915CFB58018367116A1292C11CCDB876535C6699E8217E1A1294190D83E4233ECC490D32DF17A41166E1D46FA4A1DE82A0E3B83C8BA14A8334D34B2209C9E3D2AFE9F1C5B177B82AC',
                last_results_hash:
                  'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
                evidence_hash:
                  'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
                proposer_address: '53D53755DA3B815AB029C0062DD6A2B392E640DC',
              },
              data: {
                txs: [],
              },
              evidence: {
                evidence: [],
              },
              last_commit: {
                height: '4784309',
                round: 0,
                block_id: {
                  hash: 'AA4C36661992B881273F475C1B776464A9CD74F90382229180572890821D1EFE',
                  parts: {
                    total: 1,
                    hash: '54E0DE11E48B1CACA50982BC35DFF3F8ADF2537FE46339BBCFEAD7B3F4C73A4A',
                  },
                },
                signatures: [
                  {
                    block_id_flag: 2,
                    validator_address:
                      '13FA0B679D6064772567C7A6050B42CCA1C7C8CD',
                    timestamp: '2022-05-05T10:32:09.205221184Z',
                    signature:
                      'tLZBX+J8x+DEwlm54VS+S3Wcjh9IhhooiYx9jx2IgGjrKB8zs86wIFPUBz0laejJKH0e9BzO/y6QaIlIZx/8DA==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      'EB6378B3DA7659C369C5590DA1FFB7211FC4FC2F',
                    timestamp: '2022-05-05T10:32:08.915085976Z',
                    signature:
                      'mTJF09niUfqCa48S4A8hn0kuULNWNw4wa4GKJ2+aaIlNZOwexrg1fLiagi1D3A+ikL7rsiesfrtlqecoxd1fBA==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      '34DA2E4636D96ABE36AE63D3A01A9AC86802A1CF',
                    timestamp: '2022-05-05T10:32:09.02265433Z',
                    signature:
                      '08kYh8J4isZiZehi2JM/PY7tjmsr63migsa0Cbi+7OnqbJRtZKOPCB1ORo7OJf0ZgFjvCdyOHnLF5kEY1jfJCQ==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      '91484AD0B6343D73690F1D36A80EF92B67622C47',
                    timestamp: '2022-05-05T10:32:08.947673408Z',
                    signature:
                      'tjrDmErwBxp4VsIAMjxwF3rQ7tNaCNRO/m7CMJQttkdBaPFdTs/l5XJ7JXFI2VmH2jbEL5Z4NV11XTAkx+BaCw==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      '53D53755DA3B815AB029C0062DD6A2B392E640DC',
                    timestamp: '2022-05-05T10:32:08.974241358Z',
                    signature:
                      'RKHL5pKPcritkcsLhY2n+MXl4n7AC7+gMAQIgWxqz2Iufv57DvJSZv4fPwKFm+b83GnFsYZcd+HznazNDShzBQ==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      'D13E2E3867E1B13DEBA8C9E225B4296477098DEA',
                    timestamp: '2022-05-05T10:32:08.963094284Z',
                    signature:
                      'XVpvPqETfV3HEfO9nBKyw0l9Lwes4A1xidLtwHwx3010uZUOo0eqvDnRPq/2jYHJFuy1wyP8SUAHD3Dmc8ZWDg==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      'B8095C5B57FDC602137B96E0426A3770DCF10323',
                    timestamp: '2022-05-05T10:32:08.95393629Z',
                    signature:
                      'WeCleqYeYiD0ZjuAYLD2mu9D9RMc+p3sDi/g4svA5rWifWzlxlR51PMKIxaHYsSamtThGp1thwFjPWmmOJ03DQ==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      '3619F6EC431527F02457875B7355041ADBB54772',
                    timestamp: '2022-05-05T10:32:08.934776754Z',
                    signature:
                      'mWsTW5FJ+BaMGfat1CA+o70SW3I9o32BOEdOi5WM3s+OTfDzIUl+gwNVe8FV4/IhEaVUz1dCG60yTsRDgZXACA==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      'A773EEC659DE98B71E2324E7E1815A2AD470D411',
                    timestamp: '2022-05-05T10:32:08.972816511Z',
                    signature:
                      'OegfeAO2pEchX4z5IqnGmMN+xGPzf3nhWZ5cR9+j1NLIKHuc6iVZtIQhE3e/lfurpXHKqpCs1Ok/g4DV/rPdBw==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      '0C8752F75C084919BAB5A6BC7BE8B21D8222262F',
                    timestamp: '2022-05-05T10:32:08.974411384Z',
                    signature:
                      'b6rncXhc2/IQZq+Ii4s1ZCJJa2n97g/rE6d3b9nqqyZ+HLDlwvOcWSZ9qic15Nd50uBXHRl4n4C+vu+RsdBgDg==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      '15B7DA235BEED81158737FBFE79C6264D5E2E5FF',
                    timestamp: '2022-05-05T10:32:08.944187551Z',
                    signature:
                      'xsqtVg8DPfHYifdapSiod4IA60Q/I8mWM6iynfSgmqKZdY0mTPLWpSN1wGb8ePMCRxYxt7z8DvSDvqDOfif4DA==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      '37E84F66FD7D8DC6BC65F29CB29E3C7092D53523',
                    timestamp: '2022-05-05T10:32:08.917580666Z',
                    signature:
                      'aNhOt0mRNCJUhqgptzcadzT2tbvNothemGqIfBbgZsimOUardgtthsHlpyQEJuyCP5i5UIZfKAOGGQDnBLIxAQ==',
                  },
                  {
                    block_id_flag: 2,
                    validator_address:
                      'A4DD0AF93444959959B32F59057E71F46CC5CC55',
                    timestamp: '2022-05-05T10:32:08.982260924Z',
                    signature:
                      'jYnVE9cqQIt5V4/Gzg7gfSnZB8yWDkg1whViryG7kH3cAt3/oelQYl06VBg6zlxrCvYIz8a7c46waVYpBrLFBA==',
                  },
                ],
              },
            },
            result_begin_block: {},
            result_end_block: {
              validator_updates: null,
            },
          },
        },
        events: {
          'tm.event': ['NewBlock'],
        },
      },
    });

    expect(screen.getByTestId('new-blocks')).toHaveTextContent('0 new blocks');

    act(() => {
      mocket.send(update);
      console.log(
        `update sent, after update mocket messages array is ${mocket.messages.length}`
      );
    });
    expect(screen.getByTestId('new-blocks')).toHaveTextContent('1 new blocks');
    //
    // act(() => {
    //   mocket.send(update);
    // });
    // expect(screen.getByTestId('new-blocks')).toHaveTextContent('3 new blocks');
  });
});
