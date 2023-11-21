from vega_sim.service import VegaService
from actions.vega import submit_multiple_orders, submit_order, submit_liquidity
from wallet_config import MM_WALLET, MM_WALLET2, TERMINATE_WALLET, wallets
import logging

logger = logging.getLogger()

mint_amount: float = 10e5
market_name = "BTC:DAI_2023"

def setup_simple_market(
    vega: VegaService,
    approve_proposal=True,
    custom_market_name=market_name,
    custom_asset_name="tDAI",
    custom_asset_symbol="tDAI",
):
    for wallet in wallets:
        vega.create_key(wallet.name)

    vega.mint(
        MM_WALLET.name,
        asset="VOTE",
        amount=mint_amount,
    )

    vega.update_network_parameter(
        MM_WALLET.name, parameter="market.fee.factors.makerFee", new_value="0.1"
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    vega.create_asset(
        MM_WALLET.name,
        name=custom_asset_name,
        symbol=custom_asset_symbol,
        decimals=5,
        max_faucet_amount=1e10,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    tdai_id = vega.find_asset_id(symbol=custom_asset_symbol)
    logger.info(f"Created asset: {custom_asset_symbol}")

    vega.mint(
        "Key 1",
        asset=tdai_id,
        amount=mint_amount,
    )

    vega.mint(
        MM_WALLET.name,
        asset=tdai_id,
        amount=mint_amount,
    )

    vega.mint(
        MM_WALLET2.name,
        asset=tdai_id,
        amount=mint_amount,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    market_id = vega.create_simple_market(
        custom_market_name,
        proposal_key=MM_WALLET.name,
        settlement_asset_id=tdai_id,
        termination_key=TERMINATE_WALLET.name,
        market_decimals=5,
        approve_proposal=approve_proposal,
        forward_time_to_enactment=approve_proposal,
    )

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    return market_id


def setup_simple_successor_market(
    vega: VegaService, parent_market_id, tdai_id, market_name, approve_proposal=True
):
    market_id = vega.create_simple_market(
        market_name,
        proposal_key=MM_WALLET.name,
        settlement_asset_id=tdai_id,
        termination_key=MM_WALLET2.name,
        market_decimals=5,
        approve_proposal=approve_proposal,
        forward_time_to_enactment=approve_proposal,
        parent_market_id=parent_market_id,
        parent_market_insurance_pool_fraction=0.5,
    )
    submit_liquidity(vega, MM_WALLET.name, market_id)
    submit_multiple_orders(
        vega, MM_WALLET.name, market_id, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, market_id, "SIDE_BUY", [[1, 90], [1, 95]]
    )

    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 1, 110)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    return market_id


def setup_opening_auction_market(vega: VegaService, market_id: str = None, **kwargs):
    if market_id is None or market_id not in vega.all_markets():
        market_id = setup_simple_market(vega, **kwargs)

    submit_liquidity(vega, MM_WALLET.name, market_id)
    submit_multiple_orders(
        vega, MM_WALLET.name, market_id, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, market_id, "SIDE_BUY", [[1, 90], [1, 95]]
    )

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    return market_id


def setup_continuous_market(vega: VegaService, market_id: str = None, **kwargs):
    if market_id is None or market_id not in vega.all_markets():
        market_id = setup_opening_auction_market(vega, **kwargs)

    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 1, 110)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    return market_id

def setup_perps_market(
    vega: VegaService,
    custom_asset_name="tDAI",
    custom_asset_symbol="tDAI",
):
    for wallet in wallets:
        vega.create_key(wallet.name)

    vega.mint(
        MM_WALLET.name,
        asset="VOTE",
        amount=mint_amount,
    )

    vega.update_network_parameter(
        MM_WALLET.name, parameter="market.fee.factors.makerFee", new_value="0.1"
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    vega.create_asset(
        MM_WALLET.name,
        name=custom_asset_name,
        symbol=custom_asset_symbol,
        decimals=5,
        max_faucet_amount=1e10,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    tdai_id = vega.find_asset_id(symbol=custom_asset_symbol)
    logger.info(f"Created asset: {custom_asset_symbol}")

    vega.mint(
        "Key 1",
        asset=tdai_id,
        amount=mint_amount,
    )

    vega.mint(
        MM_WALLET.name,
        asset=tdai_id,
        amount=mint_amount,
    )

    vega.mint(
        MM_WALLET2.name,
        asset=tdai_id,
        amount=mint_amount,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    vega.update_network_parameter(
        proposal_key=MM_WALLET.name,
        parameter="limits.markets.proposePerpetualEnabled",
        new_value="1",
    )

    vega.wait_for_total_catchup()

    market_id = vega.create_simple_perps_market(
        market_name="BTC:DAI_Perpetual",
        proposal_key=MM_WALLET.name,
        settlement_asset_id=tdai_id,
        settlement_data_key=TERMINATE_WALLET.name,
        funding_payment_frequency_in_seconds=10,
        market_decimals=5,
        )
    vega.wait_for_total_catchup()

    submit_liquidity(vega, MM_WALLET.name, market_id)
    submit_multiple_orders(
        vega, MM_WALLET.name, market_id, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, market_id, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 1, 110)
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    return market_id