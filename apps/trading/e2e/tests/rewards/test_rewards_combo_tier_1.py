import pytest
from rewards_test_ids import *
from typing import Tuple, Generator
import vega_sim.proto.vega as vega_protos
from playwright.sync_api import Page, expect
from conftest import init_vega, init_page, auth_setup, risk_accepted_setup, cleanup_container
from fixtures.market import setup_continuous_market
from actions.utils import next_epoch, change_keys
from wallet_config import MM_WALLET
from vega_sim.null_service import VegaServiceNull


@pytest.fixture(scope="module")
def setup_environment(request, browser) -> Generator[Tuple[Page, str, str], None, None]:
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))

        tDAI_market, tDAI_asset_id = setup_market_with_reward_program(
            vega_instance)

        with init_page(vega_instance, browser, request) as page:
            risk_accepted_setup(page)
            auth_setup(vega_instance, page)
            page.goto(REWARDS_URL)
            change_keys(page, vega_instance, PARTY_B)
            yield page, tDAI_market, tDAI_asset_id


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
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_GLOBAL_REWARD,
        asset=tDAI_asset_id,
        amount=100,
        factor=1.0,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
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
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
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
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
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
    next_epoch(vega=vega)
    return tDAI_market, tDAI_asset_id


def test_network_reward_pot(setup_environment: Tuple[Page, str, str],
                            ) -> None:
    page, tDAI_market, tDAI_asset_id = setup_environment
    expect(page.get_by_test_id(TOTAL_REWARDS)).to_have_text("183.33333 tDAI")


def test_reward_multiplier(
    setup_environment: Tuple[Page, str, str],
) -> None:
    page, tDAI_market, tDAI_asset_id = setup_environment
    expect(page.get_by_test_id(COMBINED_MULTIPLIERS)).to_have_text("4x")
    expect(page.get_by_test_id(STREAK_REWARD_MULTIPLIER_VALUE)).to_have_text(
        "2x"
    )
    expect(page.get_by_test_id(HOARDER_REWARD_MULTIPLIER_VALUE)).to_have_text(
        "2x"
    )


def test_reward_history(
    setup_environment: Tuple[Page, str, str],
) -> None:
    page, tDAI_market, tDAI_asset_id = setup_environment
    page.locator('[name="fromEpoch"]').fill("1")
    
    expect((page.get_by_role(ROW).locator(PRICE_TAKING_COL_ID)).nth(1)).to_have_text(
        "299.99999100.00%"
    )
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(
        1)).to_have_text("299.99999")
    page.get_by_test_id(EARNED_BY_ME_BUTTON).click()
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text(
        "183.33333"
    )


def test_epoch_counter(
    setup_environment: Tuple[Page, str, str],
) -> None:
    page, tDAI_market, tDAI_asset_id = setup_environment
    expect(page.get_by_test_id("epoch-countdown")).to_have_text("Epoch 14Awaiting next epoch")


def test_staking_reward(
    setup_environment: Tuple[Page, str, str],
):
    page, tDAI_market, tDAI_asset_id = setup_environment
    expect(page.get_by_test_id("active-rewards-card")).to_have_count(2)
    staking_reward_card = page.get_by_test_id("active-rewards-card").nth(1)
    expect(staking_reward_card).to_be_visible()
    expect(staking_reward_card.get_by_test_id(
        "entity-scope")).to_have_text("Individual")
    expect(staking_reward_card.get_by_test_id(
        "locked-for")).to_have_text("0 epochs")
    expect(staking_reward_card.get_by_test_id(
        "reward-value")).to_have_text("100.00")
    expect(staking_reward_card.get_by_test_id(
        "distribution-strategy")).to_have_text("Pro rata")
    expect(staking_reward_card.get_by_test_id("dispatch-metric-info")).to_have_text(
        "Staking rewards"
    )
    expect(staking_reward_card.get_by_test_id(
        "assessed-over")).to_have_text("1 epoch")
    expect(staking_reward_card.get_by_test_id(
        "scope")).to_have_text("Not eligible ")
    expect(staking_reward_card.get_by_test_id(
        "staking-requirement")).to_have_text("1.00")
    expect(staking_reward_card.get_by_test_id(
        "average-position")).to_have_text("-")
