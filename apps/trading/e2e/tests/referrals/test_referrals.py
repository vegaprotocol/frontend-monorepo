import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from conftest import init_vega
from fixtures.market import setup_continuous_market
from actions.utils import WalletConfig, create_and_faucet_wallet, next_epoch
from actions.vega import submit_order, submit_liquidity

PARTY_A = WalletConfig("party_a", "party_a")
PARTY_B = WalletConfig("party_b", "party_b")

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture(scope="module")
def continuous_market(vega):
    return setup_continuous_market(vega)

@pytest.mark.skip
@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_referral_scenario(continuous_market, vega: VegaService, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_A)

    create_and_faucet_wallet(vega=vega, wallet=PARTY_B)
    vega.wait_for_total_catchup()
    vega.update_referral_program(
        proposal_key="mm",
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
    next_epoch(vega=vega)

    vega.wait_for_total_catchup()
    vega.create_referral_set(key_name=PARTY_A.name)
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    print(vega.list_referral_sets())
    referral_set_id = list(vega.list_referral_sets().keys())[0]
    print(referral_set_id)
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
    submit_liquidity(vega, "mm", continuous_market)

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_order(vega, "Key 1", continuous_market, "SIDE_SELL", 100000, 104.50000)
    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 100000, 104.50000)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)

    vega.wait_for_total_catchup()
    page.pause()
    expect(page)