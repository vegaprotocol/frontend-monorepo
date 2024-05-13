import pytest
from playwright.sync_api import Page
from vega_sim.null_service import VegaServiceNull
import vega_sim.proto.vega as vega_protos
from actions.utils import create_and_faucet_wallet
from wallet_config import WalletConfig
from actions.vega import submit_order
from actions.utils import change_keys
from fixtures.market import setup_continuous_market
from actions.utils import next_epoch, change_keys
from wallet_config import MM_WALLET
from vega_sim.null_service import VegaServiceNull

def keys(vega):
    PARTY_A = WalletConfig("PARTY_A", "PARTY_A")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_A)
    PARTY_B = WalletConfig("PARTY_B", "PARTY_B")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_B)
    PARTY_C = WalletConfig("PARTY_C", "PARTY_C")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_C)
    PARTY_D = WalletConfig("PARTY_D", "PARTY_D")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_D)
    return PARTY_A, PARTY_B, PARTY_C, PARTY_D


VESTING = """
{
    "tiers": [
        {
            "minimum_quantum_balance": "10000000",
            "reward_multiplier": "2"
        }
    ]
}
"""

def check_pnl_color_value(element, expected_color, expected_value):
    color = element.evaluate("element => getComputedStyle(element).color")
    value = element.inner_text()
    assert color == expected_color, f"Unexpected color: {color}"
    assert value == expected_value, f"Unexpected value: {value}"

#TODO move this test to jest
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_pnl(vega: VegaServiceNull, page: Page):
    tDAI_market = setup_continuous_market(vega)
    page.goto(f"/#/markets/{tDAI_market}")
    page.pause()
    """ PARTY_A, PARTY_B, PARTY_C, PARTY_D = keys(vega)
    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(key_name=PARTY_B.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_C.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_A.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_D.name, asset=tDAI_asset_id, amount=100000)
    next_epoch(vega=vega)

    vega.update_network_parameter(
        proposal_key=MM_WALLET.name,
        parameter="rewards.vesting.benefitTiers",
        new_value=VESTING,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.update_network_parameter(
        MM_WALLET.name, parameter="reward.asset", new_value=tDAI_asset_id
    )

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_REALISED_RETURN,
        asset=tDAI_asset_id,
        reference="reward",
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_REALISED_RETURN,
        amount=100,
        factor=1.0,
    )
    vega.submit_order(
        trading_key=PARTY_B.name,
        market_id=tDAI_market,
        order_type="TYPE_MARKET",
        time_in_force="TIME_IN_FORCE_IOC",
        side="SIDE_BUY",
        volume=1,
    )
    vega.submit_order(
        trading_key=PARTY_A.name,
        market_id=tDAI_market,
        order_type="TYPE_MARKET",
        time_in_force="TIME_IN_FORCE_IOC",
        side="SIDE_BUY",
        volume=1,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    next_epoch(vega=vega)
    page.set_viewport_size({"width": 1748, "height": 977}) """
    submit_order(vega, "Key 1", tDAI_market, "SIDE_BUY", 1, 104.50000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    

    submit_order(vega, "Key 1", tDAI_market, "SIDE_SELL", 2, 101.50000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.pause()
    vega.submit_order(
        trading_key=MM_WALLET.name,
        market_id=tDAI_market,
        order_type="TYPE_MARKET",
        time_in_force="TIME_IN_FORCE_FOK",
        side="SIDE_SELL",
        volume=1,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
    page.pause()