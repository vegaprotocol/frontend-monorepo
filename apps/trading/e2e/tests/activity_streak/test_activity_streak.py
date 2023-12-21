import pytest
import vega_sim.proto.vega as vega_protos
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from conftest import init_vega
from fixtures.market import setup_continuous_market
from actions.utils import (
    create_and_faucet_wallet,
        next_epoch)

from wallet_config import MM_WALLET, MM_WALLET2, GOVERNANCE_WALLET, PARTY_A, PARTY_B, PARTY_C
from vega_sim.service import VegaService


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega

@pytest.fixture(scope="module")
def vega_setup(vega):
    tDAI_market = setup_continuous_market(vega)
    tBTC_market = setup_continuous_market(
        vega,
        custom_market_name="tBTC_MARKET",
        custom_asset_name="tBTC",
        custom_asset_symbol="tBTC"
    ) 
    vega.update_network_parameter(
            proposal_key=MM_WALLET.name,
            parameter="rewards.activityStreak.benefitTiers",
            new_value=ACTIVITY_STREAKS,
        )
    vega.wait_fn(5)
    next_epoch(vega=vega)
    vega.update_network_parameter(
        proposal_key=MM_WALLET.name,
        parameter="rewards.vesting.benefitTiers",
        new_value=VESTING,
    )
    vega.wait_fn(5)
    next_epoch(vega=vega)
    return tDAI_market, tBTC_market

#@pytest.fixture(scope="module")
#def continuous_market(vega):
    return setup_continuous_market(vega)

""" @pytest.fixture(scope="module")
def continuous_market_2(vega):
    market_id_2 = setup_continuous_market(
        vega,
        custom_market_name="tBTC_MARKET",
        custom_asset_name="tBTC",
        custom_asset_symbol="tBTC"
    )   
    return market_id_2 """

ACTIVITY_STREAKS = """
{
    "tiers": [
        {
            "minimum_activity_streak": 1, 
            "reward_multiplier": "2.0", 
            "vesting_multiplier": "1.1"
        },
        {
            "minimum_activity_streak": 2,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 3,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 4,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 5,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 6,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 7,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 8,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 9,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 10,
            "reward_multiplier": "1.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 11,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        },
        {
            "minimum_activity_streak": 12,
            "reward_multiplier": "3.0",
            "vesting_multiplier": "1.2"   
        }
    ]
}
"""
VESTING = """
{
    "tiers": [
        {
            "minimum_quantum_balance": "10",
            "reward_multiplier": "1.05"
        },
        {
            "minimum_quantum_balance": "100",
            "reward_multiplier": "1.10"   
        }
    ]
}
"""


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_activity_streak(vega_setup, vega: VegaService, page: Page):

    tDAI_market, tBTC_market = vega_setup
    
    create_and_faucet_wallet(vega=vega, wallet=PARTY_A, amount=1e3)
    create_and_faucet_wallet(vega=vega, wallet=PARTY_B, amount=1e5)
    create_and_faucet_wallet(vega=vega, wallet=PARTY_C, amount=1e5)
    vega.wait_for_total_catchup()
    
    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    tBTC_asset_id = vega.find_asset_id(symbol="tBTC")
    vega_asset_id = vega.find_asset_id(symbol="VOTE")
    vega.update_network_parameter(
        MM_WALLET.name, parameter="reward.asset", new_value=tDAI_asset_id
    )
    print(tBTC_asset_id)
    print(vega_asset_id)   
    vega.wait_fn(5)
    vega.wait_for_total_catchup() 
    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
        reference="reward",
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        #lock_period= 5,
        amount=100,
        factor=1.0,
    )
    # Generate trades for non-zero metrics
    vega.submit_order(
        trading_key=PARTY_B.name,
        market_id=tDAI_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_SELL",
        price=0.30,
        volume=100,
    )
    vega.submit_order(
        trading_key=PARTY_C.name,
        market_id=tDAI_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_BUY",
        price=0.30,
        volume=100,
    )
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
    next_epoch(vega=vega)

    
    vega.mint(key_name="Key 1", asset=tBTC_asset_id, amount=100000)
    vega.mint(key_name=PARTY_B.name, asset=tBTC_asset_id, amount=10000000)
    vega.mint(key_name=PARTY_C.name, asset=tBTC_asset_id, amount=10000000)
    vega.mint(key_name=PARTY_A.name, asset=tBTC_asset_id, amount=100000)
    vega.mint(key_name=MM_WALLET.name, asset=tBTC_asset_id, amount=100000)
    vega.mint(key_name=MM_WALLET2.name, asset=tBTC_asset_id, amount=100000)
    page.goto(f"/#/markets/{tBTC_market}")
    page.pause()
    vote_id = vega.find_asset_id("VOTE")
    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tBTC_asset_id,
        reference="reward",
        #lock_period= 3,
        asset_for_metric=tBTC_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        amount=100,
        factor=1.0,
    )
    """ vega.recurring_transfer(
        from_key_name=PARTY_C.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tBTC_asset_id,
        reference="reward",
        asset_for_metric=tBTC_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        amount=100,
        factor=1.0,
    ) """
    # Generate trades for non-zero metrics
    vega.submit_order(
        trading_key=PARTY_B.name,
        market_id=tBTC_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_SELL",
        price=0.30,
        volume=100,
    )
    vega.submit_order(
        trading_key=PARTY_A.name,
        market_id=tBTC_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_BUY",
        price=0.30,
        volume=100,
    )
    vega.submit_order(
        trading_key=PARTY_C.name,
        market_id=tBTC_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_SELL",
        price=0.30,
        volume=100,
    )
    vega.submit_order(
        trading_key=PARTY_A.name,
        market_id=tBTC_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_BUY",
        price=0.30,
        volume=200,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
    vega.forward("20s")
    vega.wait_for_total_catchup()
    page.pause()
    next_epoch(vega=vega)
    page.pause()
    next_epoch(vega=vega)
    page.pause()
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    page.pause()
    page.goto(f"/#/markets/{tBTC_market}")
    page.pause()
    expect()
