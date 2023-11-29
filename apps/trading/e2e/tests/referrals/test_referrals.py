import re
import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from conftest import init_vega
from fixtures.market import setup_continuous_market, setup_simple_market
from actions.utils import WalletConfig, change_keys, create_and_faucet_wallet, element_contains_text, forward_time, next_epoch
from actions.vega import submit_order, submit_liquidity
from wallet_config import MM_WALLET, MM_WALLET2, TERMINATE_WALLET

PARTY_A = WalletConfig("party_a", "party_a")
PARTY_B = WalletConfig("party_b", "party_b")

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega

sell_orders = [[1, 111], [1, 111], [1, 112], [1, 112], [1, 113], [1, 113], [1, 114], [1, 114], [1, 115], [1, 115]]
buy_orders = [[1, 106], [1, 107], [1, 108]]

@pytest.fixture(scope="module")
def continuous_market(vega):
    market = setup_simple_market(vega, custom_quantum=100000)
    return setup_continuous_market(vega, market, buy_orders, sell_orders, add_liquidity=False)

def check_volume_and_tier(page: Page, expected_volume, expected_tier):
    if "referrals" in page.url:
         page.reload()
    else:
         page.goto("/#/referrals/")

    combined_volume_element = page.get_by_test_id('combined-volume-value')
    current_tier_element = page.get_by_test_id('current-tier-value')

    volume_matched = element_contains_text(combined_volume_element, expected_volume)
    tier_matched = element_contains_text(current_tier_element, expected_tier)

    return volume_matched, tier_matched

@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_referral_scenario(continuous_market, vega: VegaService, page: Page):
    page.goto(f"/#/markets/{continuous_market}")

    create_and_faucet_wallet(vega=vega, wallet=PARTY_A)
    create_and_faucet_wallet(vega=vega, wallet=PARTY_B)
    forward_time(vega)

    vega.update_referral_program(
        proposal_key=MM_WALLET.name,
        benefit_tiers=[
            {
                "minimum_running_notional_taker_volume": 100,
                "minimum_epochs": 1,
                "referral_reward_factor": 0.01,
                "referral_discount_factor": 0.01,
            },
            {
                "minimum_running_notional_taker_volume": 200,
                "minimum_epochs": 2,
                "referral_reward_factor": 0.02,
                "referral_discount_factor": 0.02,
            },
            {
                "minimum_running_notional_taker_volume": 300,
                "minimum_epochs": 3,
                "referral_reward_factor": 0.03,
                "referral_discount_factor": 0.03,
            },
        ],
        staking_tiers=[
            {"minimum_staked_tokens": 100, "referral_reward_multiplier": 1},
            {"minimum_staked_tokens": 1000, "referral_reward_multiplier": 2},
            {"minimum_staked_tokens": 10000, "referral_reward_multiplier": 2},
        ],
        window_length=1,
    )
    forward_time(vega, True)

    vega.create_referral_set(key_name=PARTY_A.name)
    forward_time(vega, True)

    referral_set_id = list(vega.list_referral_sets().keys())[0]
    vega.apply_referral_code(key_name=PARTY_B.name, id=referral_set_id)

    tdai_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(
        "Key 1",
        asset=tdai_id,
        amount=10e6,
    )
    vega.mint(
        PARTY_B.name,
        asset=tdai_id,
        amount=10e6,
    )

    submit_liquidity(vega, MM_WALLET.name, continuous_market, 100, 100)
    forward_time(vega, True)
    change_keys(page, vega, PARTY_B.name)

    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 1, 115)
    forward_time(vega, True)
    volume_matched, tier_matched = check_volume_and_tier(page, r'^1\d{2}$', "3")
    assert volume_matched
    assert tier_matched

    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 2, 115)
    forward_time(vega, True)
    volume_matched, tier_matched = check_volume_and_tier(page, r'^2\d{2}$', "2")
    assert volume_matched
    assert tier_matched

    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 3, 115)
    forward_time(vega, True)
    volume_matched, tier_matched = check_volume_and_tier(page, r'^3\d{2}$', "1")
    assert volume_matched
    assert tier_matched



