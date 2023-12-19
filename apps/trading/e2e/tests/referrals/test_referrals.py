import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from conftest import init_vega
from fixtures.market import setup_continuous_market, setup_simple_market
from actions.utils import change_keys, create_and_faucet_wallet, forward_time, selector_contains_text
from actions.vega import submit_order, submit_liquidity
from wallet_config import MM_WALLET, PARTY_A, PARTY_B

SELL_ORDERS = [[1, 111], [1, 111], [1, 112], [1, 112], [
    1, 113], [1, 113], [1, 114], [1, 114], [1, 115], [1, 115]]
BUY_ORDERS = [[1, 106], [1, 107], [1, 108]]


@pytest.fixture(scope="module")
def vega(request, local_server):
    with init_vega(request, local_server) as vega:
        yield vega


@pytest.fixture(scope="module")
def continuous_market(vega):
    market = setup_simple_market(vega, custom_quantum=100000)
    return setup_continuous_market(vega, market, BUY_ORDERS, SELL_ORDERS, add_liquidity=False)


def generate_referrer_expected_value_dic(expected_base_commission, expected_staking_multiplier, expected_final_commission_rate, expected_volume, expected_num_traders, expected_total_commission):
    return {
        '[data-testid=my-volume-value]': expected_volume,
        '[data-testid=total-commission-value]': expected_total_commission,
        '[data-testid=base-commission-rate-value]': expected_base_commission,
        '[data-testid=number-of-traders-value]': expected_num_traders,
        '[data-testid=final-commission-rate-value]': expected_final_commission_rate,
        '[data-testid=staking-multiplier-value]': expected_staking_multiplier
    }


def generate_referral_expected_value_dic(expected_volume, expected_tier, expected_discount, expected_epochs, expected_epochs_to_next_tier):
    return {
        '[data-testid=combined-volume-value]': expected_volume,
        '[data-testid=current-tier-value]': expected_tier,
        '[data-testid=discount-value]': expected_discount,
        '[data-testid=epochs-in-set-value]': expected_epochs,
        '[data-testid=epochs-to-next-tier-value]': expected_epochs_to_next_tier
    }


def check_tile_values(page: Page, expected_results: dict):
    if "referrals" in page.url:
        page.reload()
    else:
        page.goto("/#/referrals/")

    for selector, expected_text in expected_results.items():
        assert selector_contains_text(
            page, selector, expected_text), f"Expected text '{expected_text}' not found in selector '{selector}'"


def create_benefit_tier(minimum_running_notional_taker_volume, minimum_epochs, referral_reward_factor, referral_discount_factor):
    return {
        "minimum_running_notional_taker_volume": minimum_running_notional_taker_volume,
        "minimum_epochs": minimum_epochs,
        "referral_reward_factor": referral_reward_factor,
        "referral_discount_factor": referral_discount_factor,
    }


def create_staking_tier(minimum_staked_tokens, referral_reward_multiplier):
    return {
        "minimum_staked_tokens": minimum_staked_tokens,
        "referral_reward_multiplier": referral_reward_multiplier,
    }


def setup_market_and_referral_scheme(vega: VegaService, continuous_market: str, page: Page):
    page.goto(f"/#/markets/{continuous_market}")

    create_and_faucet_wallet(vega=vega, wallet=PARTY_A)
    create_and_faucet_wallet(vega=vega, wallet=PARTY_B)
    forward_time(vega)

    benefit_tiers = []
    staking_tiers = []
    for i in range(1, 4):
        benefit_tiers.append(create_benefit_tier(
            i * 100, i, i * 0.01, i * 0.01))
        staking_tiers.append(create_staking_tier(
            i * 100, i))

    vega.update_referral_program(
        proposal_key=MM_WALLET.name,
        benefit_tiers=benefit_tiers,
        staking_tiers=staking_tiers,
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
    forward_time(vega)


@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_can_traverse_up_and_down_through_tiers(continuous_market, vega: VegaService, page: Page):
    setup_market_and_referral_scheme(vega, continuous_market, page)
    change_keys(page, vega, PARTY_B.name)
    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 1, 115)
    forward_time(vega, True)
    check_tile_values(page, generate_referral_expected_value_dic(
        "110", "1", "1%", "1", "1"))

    change_keys(page, vega, PARTY_A.name)
    check_tile_values(page, generate_referrer_expected_value_dic(
        "1%", "1", "1%", "0", "1", "0"))

    change_keys(page, vega, PARTY_B.name)
    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 2, 115)
    forward_time(vega, True)
    check_tile_values(page, generate_referral_expected_value_dic(
        "221", "2", "2%", "2", "1"))

    change_keys(page, vega, PARTY_A.name)
    check_tile_values(page, generate_referrer_expected_value_dic(
        "2%", "1", "2%", "0", "1", "0"))

    change_keys(page, vega, PARTY_B.name)
    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 3, 115)
    forward_time(vega, True)
    check_tile_values(page, generate_referral_expected_value_dic(
        "331", "3", "3%", "3", "0"))

    change_keys(page, vega, PARTY_A.name)
    check_tile_values(page, generate_referrer_expected_value_dic(
        "3%", "1", "3%", "0", "1", "1"))

    change_keys(page, vega, PARTY_B.name)
    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 1, 115)
    forward_time(vega, True)
    check_tile_values(page, generate_referral_expected_value_dic(
        "110", "1", "1%", "4", "0"))

    change_keys(page, vega, PARTY_A.name)
    check_tile_values(page, generate_referrer_expected_value_dic(
        "1%", "1", "1%", "0", "1", "1"))


@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_does_not_move_up_tiers_when_not_enough_epochs(continuous_market, vega: VegaService, page: Page):
    setup_market_and_referral_scheme(vega, continuous_market, page)
    change_keys(page, vega, PARTY_B.name)
    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 2, 115)
    forward_time(vega, True)
    check_tile_values(page, generate_referral_expected_value_dic(
        "221", "1", "1%", "1", "1"))

    change_keys(page, vega, PARTY_A.name)
    check_tile_values(page, generate_referrer_expected_value_dic(
        "2%", "1", "2%", "0", "1", "0"))
