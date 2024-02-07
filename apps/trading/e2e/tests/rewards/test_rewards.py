import pytest

import vega_sim.proto.vega as vega_protos
from playwright.sync_api import Page, expect
from conftest import init_vega, init_page, auth_setup
from fixtures.market import setup_continuous_market, market_exists
from actions.utils import next_epoch, change_keys
from wallet_config import MM_WALLET, PARTY_A, PARTY_B, PARTY_C, PARTY_D
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


@pytest.fixture(scope="module")
def market_ids():
    return {
        "vega_activity_tier_0": "default_id",
        "vega_hoarder_tier_0": "default_id",
        "vega_combo_tier_0": "default_id",
        "vega_activity_tier_1": "default_id",
        "vega_hoarder_tier_1": "default_id",
        "vega_combo_tier_1": "default_id",
    }


@pytest.fixture(scope="module")
def vega_activity_tier_0(request):
    with init_vega(request) as vega_activity_tier_0:
        yield vega_activity_tier_0


@pytest.fixture(scope="module")
def vega_hoarder_tier_0(request):
    with init_vega(request) as vega_hoarder_tier_0:
        yield vega_hoarder_tier_0


@pytest.fixture(scope="module")
def vega_combo_tier_0(request):
    with init_vega(request) as vega_combo_tier_0:
        yield vega_combo_tier_0


@pytest.fixture(scope="module")
def vega_activity_tier_1(request):
    with init_vega(request) as vega_activity_tier_1:
        yield vega_activity_tier_1


@pytest.fixture(scope="module")
def vega_hoarder_tier_1(request):
    with init_vega(request) as vega_hoarder_tier_1:
        yield vega_hoarder_tier_1


@pytest.fixture(scope="module")
def vega_combo_tier_1(request):
    with init_vega(request) as vega_combo_tier_1:
        yield vega_combo_tier_1


@pytest.fixture
def auth(vega_instance, page):
    return auth_setup(vega_instance, page)


@pytest.fixture
def page(vega_instance, browser, request):
    with init_page(vega_instance, browser, request) as page_instance:
        yield page_instance


@pytest.fixture
def vega_instance(
    reward_program,
    vega_activity_tier_0,
    vega_hoarder_tier_0,
    vega_combo_tier_0,
    vega_activity_tier_1,
    vega_hoarder_tier_1,
    vega_combo_tier_1,
    tier,
):
    if reward_program == "activity":
        return vega_activity_tier_0 if tier == 1 else vega_activity_tier_1
    elif reward_program == "hoarder":
        return vega_hoarder_tier_0 if tier == 1 else vega_hoarder_tier_1
    elif reward_program == "combo":
        return vega_combo_tier_0 if tier == 1 else vega_combo_tier_1


def setup_market_with_reward_program(vega: VegaServiceNull, reward_programs, tier):
    print(f"Started setup_market_with_{reward_programs}_{tier}")
    tDAI_market = setup_continuous_market(vega)
    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(key_name=PARTY_B.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_C.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_A.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_D.name, asset=tDAI_asset_id, amount=100000)
    next_epoch(vega=vega)
    if ACTIVITY in reward_programs:
        vega.update_network_parameter(
            proposal_key=MM_WALLET.name,
            parameter="rewards.activityStreak.benefitTiers",
            new_value=ACTIVITY_STREAKS,
        )
        print("update_network_parameter activity done")
        next_epoch(vega=vega)

    if HOARDER in reward_programs:
        vega.update_network_parameter(
            proposal_key=MM_WALLET.name,
            parameter="rewards.vesting.benefitTiers",
            new_value=VESTING,
        )
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
        # lock_period= 5,
        # TODO test lock period
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
    if tier == 1:
        next_epoch(vega=vega)
        vega.submit_order(
            trading_key=PARTY_B.name,
            market_id=tDAI_market,
            order_type="TYPE_LIMIT",
            time_in_force="TIME_IN_FORCE_GTC",
            side="SIDE_BUY",
            price=1,
            volume=1,
        )
        next_epoch(vega=vega)
        vega.submit_order(
            trading_key=PARTY_B.name,
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        vega.submit_order(
            trading_key=PARTY_D.name,
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        vega.wait_for_total_catchup()
        next_epoch(vega=vega)
        next_epoch(vega=vega)
        if HOARDER in reward_programs:
            vega.submit_order(
            trading_key=PARTY_B.name,
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        vega.submit_order(
            trading_key=PARTY_D.name,
            market_id=tDAI_market,
            order_type="TYPE_MARKET",
            time_in_force="TIME_IN_FORCE_IOC",
            side="SIDE_BUY",
            volume=1,
        )
        vega.wait_for_total_catchup()
        next_epoch(vega=vega)
        next_epoch(vega=vega)
    next_epoch(vega=vega)
    return tDAI_market, tDAI_asset_id


def set_market_reward_program(vega, reward_program, market_ids, tier):
    market_id_key = f"vega_{reward_program}_tier_{tier}"
    if reward_program == COMBO:
        market_id_key = COMBO
    market_id = market_ids.get(market_id_key, "default_id")

    print(f"Checking if market exists: {market_id}")
    if not market_exists(vega, market_id):
        print(
            f"Market doesn't exist for {reward_program} {tier}. Setting up new market."
        )

        reward_programs = [reward_program]
        if reward_program == COMBO:
            reward_programs = [ACTIVITY, HOARDER]

        market_id, _ = setup_market_with_reward_program(vega, reward_programs, tier)
        market_ids[market_id_key] = market_id

    return market_id, market_ids


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


@pytest.mark.parametrize(
    "reward_program, tier, total_rewards",
    [
        (ACTIVITY, 0, "50.00 tDAI"),
        (HOARDER, 0, "50.00 tDAI"),
        (COMBO, 0, "50.00 tDAI"),
        (ACTIVITY, 1, "116.66666 tDAI"),
        (HOARDER, 1, "166.66666 tDAI "),
        (COMBO, 1, "183.33333 tDAI"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted", "market_ids")
def test_network_reward_pot(
    reward_program,
    vega_instance: VegaServiceNull,
    page: Page,
    total_rewards,
    tier,
    market_ids,
):
    print("reward program: " + reward_program, " tier:", tier)
    market_id, market_ids = set_market_reward_program(
        vega_instance, reward_program, market_ids, tier
    )
    page.goto(REWARDS_URL)
    
    change_keys(page, vega_instance, PARTY_B.name)
    expect(page.get_by_test_id(TOTAL_REWARDS)).to_have_text(total_rewards)


@pytest.mark.parametrize(
    "reward_program, tier, reward_multiplier, streak_multiplier, hoarder_multiplier",
    [
        (ACTIVITY, 0, "1x", "1x", "1x"),
        (HOARDER, 0, "1x", "1x", "1x"),
        (COMBO, 0, "1x", "1x", "1x"),
        (ACTIVITY, 1, "2x", "2x", "1x"),
        (HOARDER, 1, "2x", "1x", "2x"),
        (COMBO, 1, "4x", "2x", "2x"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted", "market_ids")
def test_reward_multiplier(
    reward_program,
    vega_instance: VegaServiceNull,
    page: Page,
    reward_multiplier,
    streak_multiplier,
    hoarder_multiplier,
    tier,
    market_ids,
):
    print("reward program: " + reward_program, " tier:", tier)
    market_id, market_ids = set_market_reward_program(
        vega_instance, reward_program, market_ids, tier
    )
    page.goto(REWARDS_URL)
    change_keys(page, vega_instance, PARTY_B.name)
    expect(page.get_by_test_id(COMBINED_MULTIPLIERS)).to_have_text(reward_multiplier)
    expect(page.get_by_test_id(STREAK_REWARD_MULTIPLIER_VALUE)).to_have_text(
        streak_multiplier
    )
    expect(page.get_by_test_id(HOARDER_REWARD_MULTIPLIER_VALUE)).to_have_text(
        hoarder_multiplier
    )


@pytest.mark.parametrize(
    "reward_program, tier, epoch_streak",
    [
        (ACTIVITY, 0, "1"),
        (ACTIVITY, 1, "7"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted", "market_ids")
def test_activity_streak(
    reward_program,
    vega_instance: VegaServiceNull,
    page: Page,
    epoch_streak,
    tier,
    market_ids,
):
    print("reward program: " + reward_program, " tier:", tier)
    market_id, market_ids = set_market_reward_program(
        vega_instance, reward_program, market_ids, tier
    )
    page.goto(REWARDS_URL)
    change_keys(page, vega_instance, PARTY_B.name)
    if tier == 1:
        expect(page.get_by_test_id(EPOCH_STREAK)).to_have_text(
            "Active trader: " + epoch_streak + " epochs so far (Tier 1 as of last epoch)"
        )
    else:
        expect(page.get_by_test_id(EPOCH_STREAK)).to_have_text(
            "Active trader: " + epoch_streak + " epochs so far "
        )


@pytest.mark.parametrize(
    "reward_program, tier, rewards_hoarded",
    [
        (HOARDER, 0, "5,000,000"),
        (HOARDER, 1, "16,666,666"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted", "market_ids")
def test_hoarder_bonus(
    reward_program,
    vega_instance: VegaServiceNull,
    page: Page,
    rewards_hoarded,
    tier,
    market_ids,
):
    print("reward program: " + reward_program, " tier:", tier)
    market_id, market_ids = set_market_reward_program(
        vega_instance, reward_program, market_ids, tier
    )
    page.goto(REWARDS_URL)
    change_keys(page, vega_instance, PARTY_B.name)
    expect(page.get_by_test_id(HOARDER_BONUS_TOTAL_HOARDED)).to_contain_text(
        rewards_hoarded
    )


@pytest.mark.parametrize(
    "reward_program, tier, price_taking, total, earned_by_me",
    [
        (ACTIVITY, 0, "100.00100.00%", "100.00", "50.00"),
        (HOARDER, 0, "100.00100.00%", "100.00", "50.00"),
        (COMBO, 0, "100.00100.00%", "100.00", "50.00"),
        (ACTIVITY, 1, "300.00100.00%", "300.00", "116.66666"),
        (HOARDER, 1, "299.99999100.00%", "299.99999", "166.66666"),
        (COMBO, 1, "299.99999100.00%", "299.99999", "183.33333"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted", "market_ids")
def test_reward_history(
    reward_program,
    vega_instance: VegaServiceNull,
    page: Page,
    price_taking,
    total,
    earned_by_me,
    tier,
    market_ids,
):
    print("reward program: " + reward_program, " tier:", tier)
    market_id, market_ids = set_market_reward_program(
        vega_instance, reward_program, market_ids, tier
    )
    page.goto(REWARDS_URL)
    change_keys(page, vega_instance, PARTY_B.name)
    page.locator('[name="fromEpoch"]').fill("1")
    expect((page.get_by_role(ROW).locator(PRICE_TAKING_COL_ID)).nth(1)).to_have_text(
        price_taking
    )
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text(total)
    page.get_by_test_id(EARNED_BY_ME_BUTTON).click()
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text(
        earned_by_me
    )


@pytest.mark.parametrize(
    "reward_program, tier",
    [
        (ACTIVITY, 1),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted", "market_ids")
def test_redeem(
    reward_program, vega_instance: VegaServiceNull, page: Page, tier, market_ids
):
    print("reward program: " + reward_program, " tier:", tier)
    market_id, market_ids = set_market_reward_program(
        vega_instance, reward_program, market_ids, tier
    )
    page.goto(REWARDS_URL)
    change_keys(page, vega_instance, PARTY_B.name)
    page.get_by_test_id("redeem-rewards-button").click()
    available_to_withdraw = page.get_by_test_id(
        "available-to-withdraw-value"
    ).text_content()
    option_value = page.locator(
        '[data-testid="transfer-form"] [name="fromAccount"] option[value^="ACCOUNT_TYPE_VESTED_REWARDS"]'
    ).first.get_attribute("value")

    page.select_option(
        '[data-testid="transfer-form"] [name="fromAccount"]', option_value
    )
    
    page.get_by_test_id("use-max-button").first.click()
    expect(page.get_by_test_id(TRANSFER_AMOUNT)).to_have_text(available_to_withdraw)
