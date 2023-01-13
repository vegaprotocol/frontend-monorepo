import { MockedProvider } from "@apollo/client/testing";
import type { MockedResponse } from "@apollo/client/testing";
import { OracleMarkets } from "./oracle-markets";
import { render } from "@testing-library/react";
import { Table } from "../../../components/table";
import { ExplorerOracleFormMarketsDocument } from "../__generated__/OraclesForMarkets";
import { MemoryRouter } from "react-router-dom";

function renderComponent(id: string, mocks: MockedResponse[]) {
    return <MemoryRouter>
        <MockedProvider mocks={mocks}>
            <Table>
                <tbody>
                    <OracleMarkets id={id} />
                </tbody>
            </Table>
        </MockedProvider>
    </MemoryRouter>
}


describe('Oracle Markets component', () => {
   it('Renders a row with the market ID initially', () => {
     const res = render(renderComponent('123', []))
     expect(res.getByText('Market')).toBeInTheDocument()
     expect(res.getByText('123')).toBeInTheDocument()
   })


   it('Renders that this is a termination source for the right market', async () => {
    const mock = {
        request: {
            query: ExplorerOracleFormMarketsDocument,
        },
        result: {
            data: {
               marketsConnection: {
                    edges: [ 
                        { node: {
                            __typename: 'Market',
                            id: '123',
                            tradableInstrument: {
                                instrument: {
                                    product: {
                                        __typename: 'Future',
                                        dataSourceSpecForSettlementData: {
                                            id: '456'
                                        },
                                        dataSourceSpecForTradingTermination: {
                                            id: '789'
                                        }
                                    },
                                }
                            }
                        }},
                        {node: {
                            __typename: 'Market',
                            id: 'abc',
                            tradableInstrument: {
                                instrument: {
                                    product: {
                                        __typename: 'Future',
                                        dataSourceSpecForSettlementData: {
                                            id: 'def'
                                        },
                                        dataSourceSpecForTradingTermination: {
                                            id: 'ghi'
                                        }
                                    },
                                }
                            }
                        }}
                    ]
               } 
            }
        }
    }
    const res = render(renderComponent('789', [mock]))
    expect(await res.findByText('Termination for')).toBeInTheDocument()
    expect(await res.findByTestId('m-123')).toBeInTheDocument()
  })

  it('Renders that this is a settlement source for the right market', async () => {
    const mock = {
        request: {
            query: ExplorerOracleFormMarketsDocument,
        },
        result: {
            data: {
               marketsConnection: {
                    edges: [ 
                        { node: {
                            __typename: 'Market',
                            id: '123',
                            tradableInstrument: {
                                instrument: {
                                    product: {
                                        __typename: 'Future',
                                        dataSourceSpecForSettlementData: {
                                            id: '789'
                                        },
                                        dataSourceSpecForTradingTermination: {
                                            id: '123'
                                        }
                                    },
                                }
                            }
                        }},
                        {node: {
                            __typename: 'Market',
                            id: 'abc',
                            tradableInstrument: {
                                instrument: {
                                    product: {
                                        __typename: 'Future',
                                        dataSourceSpecForSettlementData: {
                                            id: 'def'
                                        },
                                        dataSourceSpecForTradingTermination: {
                                            id: 'ghi'
                                        }
                                    },
                                }
                            }
                        }}
                    ]
               } 
            }
        }
    }
    const res = render(renderComponent('789', [mock]))
    expect(await res.findByText('Settlement for')).toBeInTheDocument()
    expect(await res.findByTestId('m-123')).toBeInTheDocument()
  })


})