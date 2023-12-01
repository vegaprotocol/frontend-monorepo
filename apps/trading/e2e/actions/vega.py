from typing import List, Tuple, Optional
from vega_sim.service import VegaService, PeggedOrder

def submit_order(
    vega: VegaService,
    wallet_name: str,
    market_id: str,
    side: str,
    volume: float,
    price: float,
    peak_size: Optional[float] = None,
    minimum_visible_size: Optional[float] = None,
):
    return vega.submit_order(
        trading_key=wallet_name,
        market_id=market_id,
        time_in_force="TIME_IN_FORCE_GTC",
        order_type="TYPE_LIMIT",
        side=side,
        volume=volume,
        price=price,
        peak_size=peak_size,
        minimum_visible_size=minimum_visible_size,
    )


def submit_multiple_orders(
    vega: VegaService,
    wallet_name: str,
    market_id: str,
    side: str,
    volume_price_pair: List[Tuple[float, float]],
):
    for volume, price in volume_price_pair:
        submit_order(vega, wallet_name, market_id, side, volume, price)


def submit_liquidity(vega: VegaService, wallet_name: str, market_id: str):
    vega.submit_simple_liquidity(
        key_name=wallet_name,
        market_id=market_id,
        commitment_amount=10000,
        fee=0.000,
        is_amendment=False,
    )
    vega.submit_order(
        market_id=market_id,
        trading_key=wallet_name,
        side="SIDE_BUY",
        order_type="TYPE_LIMIT",
        pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_MID", offset=1),
        wait=False,
        time_in_force="TIME_IN_FORCE_GTC",
        volume=99,
    )
    vega.submit_order(
        market_id=market_id,
        trading_key=wallet_name,
        side="SIDE_SELL",
        order_type="TYPE_LIMIT",
        pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_MID", offset=1),
        wait=False,
        time_in_force="TIME_IN_FORCE_GTC",
        volume=99,
    )