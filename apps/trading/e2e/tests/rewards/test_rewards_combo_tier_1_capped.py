import pytest
from rewards_test_ids import *
from typing import Tuple, Generator
import vega_sim.proto.vega as vega_protos
from playwright.sync_api import Page, expect
from conftest import (
    init_vega,
    init_page,
    auth_setup,
    risk_accepted_setup,
    cleanup_container,
)
from fixtures.market import setup_continuous_market
from actions.utils import next_epoch, change_keys
from wallet_config import MM_WALLET
from vega_sim.null_service import VegaServiceNull


@pytest.fixture(scope="module")
def setup_environment(request, browser) -> Generator[Tuple[Page, str, str], None, None]:
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))

        tDAI_market, tDAI_asset_id = setup_market_with_reward_program(vega_instance)

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
        cap_reward_fee_multiple=1,
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


def test_network_reward_pot_capped(
    setup_environment: Tuple[Page, str, str],
) -> None:
    page, tDAI_market, tDAI_asset_id = setup_environment
    expect(page.get_by_test_id(TOTAL_REWARDS)).to_have_text("31.05 tDAI")


def test_reward_history_capped(
    setup_environment: Tuple[Page, str, str],
) -> None:
    page, tDAI_market, tDAI_asset_id = setup_environment
    page.locator('[name="fromEpoch"]').fill("1")
    expect((page.get_by_role(ROW).locator(PRICE_TAKING_COL_ID)).nth(1)).to_have_text(
        "62.10100.00%"
    )
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text("62.10")
    page.get_by_test_id(EARNED_BY_ME_BUTTON).click()
    expect((page.get_by_role(ROW).locator(TOTAL_COL_ID)).nth(1)).to_have_text("31.20525")


def test_reward_card_capped(
    setup_environment: Tuple[Page, str, str],
) -> None:
    page, tDAI_market, tDAI_asset_id = setup_environment
    expect(page.get_by_test_id("active-rewards-card")).to_have_count(2)
    game_1 = page.get_by_test_id("active-rewards-card").first
    expect(game_1).to_be_visible()
    expect(game_1.get_by_test_id("cappedAt")).to_have_text("x1")
