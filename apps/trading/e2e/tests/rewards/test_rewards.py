import pytest
import logging
import vega_sim.proto.vega as vega_protos
from typing import Tuple, Any
from playwright.sync_api import Page, expect
from conftest import init_vega, init_page, auth_setup
from fixtures.market import setup_continuous_market, market_exists
from actions.utils import next_epoch, change_keys
from wallet_config import MM_WALLET, PARTY_A, PARTY_B, PARTY_C, PARTY_D
from vega_sim.service import VegaService

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
    vega, _, _ = vega_instance
    return auth_setup(vega, page)


@pytest.fixture
def page(vega_instance, browser, request):
    vega, _, _ = vega_instance
    with init_page(vega, browser, request) as page_instance:
        yield page_instance


@pytest.fixture
def vega_instance(
    reward_program: str,
    vega_activity_tier_0: Any,
    vega_hoarder_tier_0: Any,
    vega_combo_tier_0: Any,
    vega_activity_tier_1: Any,
    vega_hoarder_tier_1: Any,
    vega_combo_tier_1: Any,
    market_ids: list,
    tier: int,
) -> Tuple[Any, Any, Any]:
    """
    Create a Vega instance based on the reward program and tier.

    :param reward_program: The reward program type.
    :param vega_activity_tier_0: The Vega instance for activity tier 0.
    :param vega_hoarder_tier_0: The Vega instance for hoarder tier 0.
    :param vega_combo_tier_0: The Vega instance for combo tier 0.
    :param vega_activity_tier_1: The Vega instance for activity tier 1.
    :param vega_hoarder_tier_1: The Vega instance for hoarder tier 1.
    :param vega_combo_tier_1: The Vega instance for combo tier 1.
    :param market_ids: List of market IDs.
    :param tier: The tier level.
    :return: Tuple containing the Vega instance, market ID, and tDAI asset ID.
    """

    vega_tiers = {
        ACTIVITY: (vega_activity_tier_0, vega_activity_tier_1),
        HOARDER: (vega_hoarder_tier_0, vega_hoarder_tier_1),
        COMBO: (vega_combo_tier_0, vega_combo_tier_1),
    }

    if reward_program not in vega_tiers or tier not in (0, 1):
        logging.error(f"Invalid reward_program '{reward_program}' or tier '{tier}'")
        raise ValueError(f"Invalid reward_program '{reward_program}' or tier '{tier}'")

    vega = vega_tiers[reward_program][tier]

    # Set up market with the reward program
    logging.info("Setting up Vega Instance")
    market_id, tDAI_asset_id = set_market_reward_program(
        vega, reward_program, market_ids, tier
    )

    return vega, market_id, tDAI_asset_id


def setup_market_with_reward_program(vega: VegaService, reward_programs, tier):
    print("Started setup_market_with_reward_program")
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
    return tDAI_market, tDAI_asset_id


def set_market_reward_program(vega, reward_program, market_ids, tier):
    market_id_key = f"vega_{reward_program}"
    if reward_program == COMBO:
        market_id_key = COMBO

    market_id = market_ids.get(market_id_key, "default_id")

    print(f"Checking if market exists: {market_id}")
    if not market_exists(vega, market_id):
        print(f"Market doesn't exist for {reward_program}. Setting up new market.")

        reward_programs = [reward_program]
        if reward_program == COMBO:
            reward_programs = [ACTIVITY, HOARDER]

        market_id = setup_market_with_reward_program(vega, reward_programs, tier)
        market_ids[market_id_key] = market_id

    print(f"Using market ID: {market_id}")
    return market_id


ACTIVITY_STREAKS = """
{
    "tiers": [
        {
            "minimum_activity_streak": 2, 
            "reward_multiplier": "2.0", 
            "vesting_multiplier": "1.1"
        },
        {
            "minimum_activity_streak": 5,
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
            "minimum_quantum_balance": "5000000",
            "reward_multiplier": "2"
        },
        {
            "minimum_quantum_balance": "13000001",
            "reward_multiplier": "3"   
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
        (HOARDER, 1, "116.66666 tDAI"),
        (COMBO, 1, "130.00 tDAI"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_network_reward_pot(
    reward_program, vega_instance: VegaService, page: Page, total_rewards, tier
):
    vega, market_id, tDAI_asset_id = vega_instance
    next_epoch(vega=vega)
    page.goto(REWARDS_URL)
    change_keys(page, vega, PARTY_B.name)
    expect(page.get_by_test_id(TOTAL_REWARDS)).to_have_text(total_rewards)
    # TODO Add test ID and Assert for locked,


@pytest.mark.parametrize(
    "reward_program, tier, reward_multiplier",
    [
        (ACTIVITY, 0, "1x"),
        (HOARDER, 0, "1x"),
        (COMBO, 0, "1x"),
        (ACTIVITY, 1, "2x"),
        (HOARDER, 1, "2x"),
        (COMBO, 1, "4x"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_reward_multiplier(
    reward_program, vega_instance: VegaService, page: Page, reward_multiplier, tier
):
    print("reward program: " + reward_program, " tier:", tier)
    vega, market_id, tDAI_asset_id = vega_instance
    page.goto(REWARDS_URL)
    change_keys(page, vega, PARTY_B.name)
    expect(page.get_by_test_id(COMBINED_MULTIPLIERS)).to_have_text(reward_multiplier)
    # TODO add test ids and assert for individual multipliers



@pytest.mark.parametrize(
    "reward_program, tier, epoch_streak",
    [
        (ACTIVITY, 0, "0"),
        (ACTIVITY, 1, "4"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_activity_streak(reward_program, vega_instance: VegaService, page: Page, epoch_streak, tier
):
    vega, market_id, tDAI_asset_id = vega_instance
    page.goto(REWARDS_URL)
    change_keys(page, vega, PARTY_B.name)
    page.pause()
    #TODO add proper test Id
    expect(page.locator('[class="flex flex-col"]').first).to_have_text(epoch_streak + "epochs streak")
   

@pytest.mark.parametrize(
    "reward_program, tier, rewards_hoarded",
    [
        (HOARDER, 0, "0"),
        (HOARDER, 1, "11,666,666"),
    ],
)

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_hoarder_bonus(reward_program, vega_instance: VegaService, page: Page, rewards_hoarded, tier
):
    vega, market_id, tDAI_asset_id = vega_instance
    page.goto(REWARDS_URL)
    change_keys(page, vega, PARTY_B.name)
    #TODO add proper test id
    expect(page.locator('[class="flex items-center gap-1"]').nth(1)).to_contain_text(rewards_hoarded)


@pytest.mark.parametrize(
    "reward_program, tier, price_taking, total, earned_by_me",
    [
        (ACTIVITY, 0, "100.00100.00%", "100.00", "50.00"),
        (HOARDER, 0, "100.00100.00%", "100.00", "50.00"),
        (COMBO, 0, "100.00100.00%", "100.00", "50.00"),
        (ACTIVITY, 1, "199.99999100.00%", "199.99999", "116.66666"),
        (HOARDER, 1, "199.99999100.00%", "199.99999", "116.66666"),
        (COMBO, 1, "200.00100.00%", "200.00", "130.00"),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_reward_history(
    reward_program, vega_instance: VegaService, page: Page, price_taking, total, earned_by_me, tier
):
    print("reward program: " + reward_program, " tier:", tier)
    vega, market_id, tDAI_asset_id = vega_instance
    next_epoch(vega=vega)
    page.goto(REWARDS_URL)
    change_keys(page, vega, PARTY_B.name)
    page.locator('[name="fromEpoch"]').fill("1")
    expect((page.get_by_role(ROW).locator(PRICE_TAKING_COL_ID)).nth(1)).to_have_text(
        price_taking
    )
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text(
        total
    )
    #TODO add test id
    page.get_by_text("Earned by me").click()
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text(
        earned_by_me
    )



@pytest.mark.parametrize(
    "reward_program, tier",
    [
        (ACTIVITY, 1),
    ],
)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_redeem(
    reward_program, vega_instance: VegaService, page: Page, tier
):
    print("reward program: " + reward_program, " tier:", tier)
    vega, market_id, tDAI_asset_id = vega_instance
    page.goto(REWARDS_URL)
    page.pause()
    change_keys(page, vega, PARTY_B.name)
    page.get_by_text("Redeem rewards").click()
    #ToDO add test id for the available to withdraw value
    available_to_withdraw = page.get_by_text("Available to withdraw this epoch").text_content()
    page.pause()
    option_value = page.locator(
        '[data-testid="transfer-form"] [name="fromAccount"] option[value^="ACCOUNT_TYPE_VESTED_REWARDS"]'
    ).first.get_attribute("value")

    page.select_option(
        '[data-testid="transfer-form"] [name="fromAccount"]', option_value
    )
    page.get_by_text("Use max").first.click()
    expect(page.get_by_test_id("transfer-amount")).to_have_text(available_to_withdraw)


#TODO Add tests for below.
    """ 
        @pytest.mark.usefixtures("auth", "risk_accepted")
        def test_vesting(vega_setup, vega: VegaService, page: Page):
            expect()
    """
