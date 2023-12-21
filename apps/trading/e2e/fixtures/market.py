from vega_sim.service import VegaService
from actions.vega import submit_multiple_orders, submit_order, submit_liquidity
from wallet_config import MM_WALLET, MM_WALLET2, TERMINATE_WALLET, wallets
import logging

logger = logging.getLogger()

mint_amount: float = 10e5
market_name = "BTC:DAI_2023"

default_sell_orders = [[1, 110], [1, 105]]
default_buy_orders = [[1, 90], [1, 95]]


def setup_simple_market(
    vega: VegaService,
    approve_proposal=True,
    custom_market_name=market_name,
    custom_asset_name="tDAI",
    custom_asset_symbol="tDAI",
    custom_quantum=1,
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
        quantum=custom_quantum,
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


def setup_opening_auction_market(
    vega: VegaService,
    market_id: str = None,
    buy_orders=default_buy_orders,
    sell_orders=default_sell_orders,
    add_liquidity=True,
    custom_market_name="BTC:DAI_2023",
    custom_asset_name="tDAI",
    custom_asset_symbol="tDAI",
    **kwargs,
):
    if not market_exists(vega, market_id):
        market_id = setup_simple_market(
            vega,
            custom_market_name=custom_market_name,
            custom_asset_name=custom_asset_name,
            custom_asset_symbol=custom_asset_symbol,
            **kwargs,
        )

    if add_liquidity:
        submit_liquidity(vega, MM_WALLET.name, market_id)
    submit_multiple_orders(vega, MM_WALLET.name, market_id, "SIDE_SELL", sell_orders)
    submit_multiple_orders(vega, MM_WALLET2.name, market_id, "SIDE_BUY", buy_orders)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    return market_id


def market_exists(vega: VegaService, market_id: str):
    if market_id is None:
        return False
    all_markets = vega.all_markets()
    market_ids = [market.id for market in all_markets]
    return market_id in market_ids


# Add sell orders and buy orders to put on the book
def setup_continuous_market(
    vega: VegaService,
    market_id: str = None,
    buy_orders=default_buy_orders,
    sell_orders=default_sell_orders,
    add_liquidity=True,
    custom_market_name="BTC:DAI_2023",
    custom_asset_name="tDAI",
    custom_asset_symbol="tDAI",
    **kwargs,
):
    if (
        not market_exists(vega, market_id)
        or buy_orders != default_buy_orders
        or sell_orders != default_sell_orders
    ):
        market_id = setup_opening_auction_market(
            vega,
            market_id,
            buy_orders,
            sell_orders,
            add_liquidity,
            custom_market_name=custom_market_name,
            custom_asset_name=custom_asset_name,
            custom_asset_symbol=custom_asset_symbol,
            **kwargs,
        )

    submit_order(
        vega, "Key 1", market_id, "SIDE_BUY", sell_orders[0][0], sell_orders[0][1]
    )

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


def market_exists(vega: VegaService, market_id: str):
    if market_id is None:
        return False
    all_markets = vega.all_markets()
    market_ids = [market.id for market in all_markets]
    return market_id in market_ids
