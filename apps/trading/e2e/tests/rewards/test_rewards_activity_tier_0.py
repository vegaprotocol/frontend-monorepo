import pytest
import vega_sim.proto.vega as vega_protos
from playwright.sync_api import Page, expect
from conftest import init_vega, init_page, auth_setup, risk_accepted_setup, cleanup_container
from fixtures.market import setup_continuous_market
from actions.utils import next_epoch, change_keys, create_and_faucet_wallet
from wallet_config import MM_WALLET, WalletConfig
from vega_sim.null_service import VegaServiceNull

# region Constants
ACTIVITY = "activity"
HOARDER = "hoarder"
COMBO = "combo"

REWARDS_URL = "/#/rewards"

# test IDs
COMBINED_MULTIPLIERS = "combined-multipliers"
TOTAL_REWARDS = "total-rewards"
PRICE_TAKING_COL_ID = '[col-id="priceTaking"]'
TOTAL_COL_ID = '[col-id="total"]'
ROW = "row"
STREAK_REWARD_MULTIPLIER_VALUE = "streak-reward-multiplier-value"
HOARDER_REWARD_MULTIPLIER_VALUE = "hoarder-reward-multiplier-value"
HOARDER_BONUS_TOTAL_HOARDED = "hoarder-bonus-total-hoarded"
EARNED_BY_ME_BUTTON = "earned-by-me-button"
TRANSFER_AMOUNT = "transfer-amount"
EPOCH_STREAK = "epoch-streak"

# endregion

# Keys
PARTY_A = "PARTY_A"
PARTY_B = "PARTY_B"
PARTY_C = "PARTY_C"
PARTY_D = "PARTY_D"


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))  # Register the cleanup function
        yield vega_instance



@pytest.fixture(scope="module")
def page(vega, browser, request):
    with init_page(vega, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega, page)
        page.goto(REWARDS_URL)
        change_keys(page, vega, PARTY_B)
        yield page


@pytest.fixture(scope="module", autouse=True)
def setup_market_with_reward_program(vega: VegaServiceNull):
    tDAI_market = setup_continuous_market(vega)
    PARTY_A, PARTY_B, PARTY_C, PARTY_D = keys(vega)
    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(key_name=PARTY_B.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_C.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_A.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_D.name, asset=tDAI_asset_id, amount=100000)
    next_epoch(vega=vega)

    vega.update_network_parameter(
        proposal_key=MM_WALLET.name,
        parameter="rewards.activityStreak.benefitTiers",
        new_value=ACTIVITY_STREAKS,
    )
    print("update_network_parameter activity done")
    next_epoch(vega=vega)

    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.update_network_parameter(
        MM_WALLET.name, parameter="reward.asset", new_value=tDAI_asset_id
    )

    next_epoch(vega=vega)
    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
        reference="reward",
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
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

    vega.wait_for_total_catchup()

    next_epoch(vega=vega)
    return tDAI_market, tDAI_asset_id


ACTIVITY_STREAKS = """
{
    "tiers": [
        {
            "minimum_activity_streak": 2, 
            "reward_multiplier": "2.0", 
            "vesting_multiplier": "1.1"
        }
    ]
}
"""


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


@pytest.mark.xdist_group(name="test_rewards_activity_tier_0")
def test_network_reward_pot(
    page: Page,
):
    expect(page.get_by_test_id(TOTAL_REWARDS)).to_have_text("50.00 tDAI")


@pytest.mark.xdist_group(name="test_rewards_activity_tier_0")
def test_reward_multiplier(
    page: Page,
):
    expect(page.get_by_test_id(COMBINED_MULTIPLIERS)).to_have_text("1x")
    expect(page.get_by_test_id(STREAK_REWARD_MULTIPLIER_VALUE)).to_have_text("1x")
    expect(page.get_by_test_id(HOARDER_REWARD_MULTIPLIER_VALUE)).to_have_text("1x")


@pytest.mark.xdist_group(name="test_rewards_activity_tier_0")
def test_activity_streak(
    page: Page,
):
    expect(page.get_by_test_id(EPOCH_STREAK)).to_have_text(
        "Active trader: 1 epochs so far "
    )


@pytest.mark.xdist_group(name="test_rewards_activity_tier_0")
def test_reward_history(
    page: Page,
):
    page.locator('[name="fromEpoch"]').fill("1")
    expect((page.get_by_role(ROW).locator(PRICE_TAKING_COL_ID)).nth(1)).to_have_text(
        "100.00100.00%"
    )
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text("100.00")
    page.get_by_test_id(EARNED_BY_ME_BUTTON).click()
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text("50.00")
