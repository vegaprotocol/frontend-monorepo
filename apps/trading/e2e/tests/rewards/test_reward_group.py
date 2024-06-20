import pytest
from rewards_test_ids import *
from typing import Tuple, Generator
from vega_python_protos import vega as vega_protos
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
    tDAI_market2 = setup_continuous_market(vega, custom_asset_name="tDAI2", custom_market_name="BTC:DAI2", custom_asset_symbol="tDAI2")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    print(tDAI_asset_id)
    vega.update_network_parameter(
        MM_WALLET.name, parameter="reward.asset", new_value=tDAI_asset_id
    )

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
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
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    tDAI_asset_id2 = vega.find_asset_id(symbol="tDAI2")
    vega.mint(key_name=PARTY_B.name, asset=tDAI_asset_id2, amount=100000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
        reference="reward",
        markets=[tDAI_market2],
        asset_for_metric=tDAI_asset_id2,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        amount=100,
        factor=1.0,
    )
    current_epoch = vega.statistics().epoch_seq
    game_start = current_epoch + 1
    game_end = current_epoch + 14
    vega.recurring_transfer(
        from_key_name=PARTY_B.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
        reference="reward",
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        entity_scope=vega_protos.vega.ENTITY_SCOPE_TEAMS,
        n_top_performers=1,
        amount=100,
        factor=1.0,
        start_epoch=game_start,
        end_epoch=game_end,
        window_length=15,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
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

def test_reward_group_card(
    setup_environment: Tuple[Page, str, str],
):
    page, tDAI_market, tDAI_asset_id = setup_environment
    expect(page.get_by_test_id("active-rewards-card")).to_have_count(2)
    reward_group_card = page.get_by_test_id("active-rewards-card").first
    expect(reward_group_card).to_be_visible()
    expect(reward_group_card.get_by_test_id(
        "entity-scope")).to_have_text("Individual")
    expect(reward_group_card.get_by_test_id(
        "locked-for")).to_have_text("1 epoch")
    expect(reward_group_card.get_by_test_id(
        "reward-value")).to_have_text("200.00")
    expect(reward_group_card.get_by_test_id(
        "distribution-strategy")).to_have_text("Pro rata")
    expect(reward_group_card.get_by_test_id("dispatch-metric-info")).to_have_text(
        "Price maker fees paid"
    )
    expect(reward_group_card.locator("button")).to_have_text(
        "See details of 2 rewards"
    )

def test_reward_group_popup(
    setup_environment: Tuple[Page, str, str],
):
    page, tDAI_market, tDAI_asset_id = setup_environment
    expect(page.get_by_test_id("active-rewards-card")).to_have_count(2)
    staking_reward_card = page.get_by_test_id("active-rewards-card").first
    staking_reward_card.locator("button").click()

    expect(page.get_by_test_id("dialog-content").first).to_be_visible()
    reward_popup = page.get_by_test_id("dialog-content").first
    expect(reward_popup.get_by_test_id("dialog-title")).to_have_text("Price maker fees paid")

    expect(reward_popup.get_by_test_id("active-rewards-card")).to_have_count(2)
    popup_reward_card_1 = reward_popup.get_by_test_id("active-rewards-card").first
    expect(popup_reward_card_1).to_be_visible()
    expect(popup_reward_card_1.get_by_test_id(
        "entity-scope")).to_have_text("Individual")
    expect(popup_reward_card_1.get_by_test_id(
        "locked-for")).to_have_text("1 epoch")
    expect(popup_reward_card_1.get_by_test_id(
        "reward-value")).to_have_text("100.00")
    expect(popup_reward_card_1.get_by_test_id(
        "distribution-strategy")).to_have_text("Pro rata")
    expect(popup_reward_card_1.get_by_test_id("dispatch-metric-info")).to_have_text(
        "Price maker fees paid • BTC:DAI2"
    )
    expect(popup_reward_card_1.get_by_test_id(
        "scope")).to_have_text("Eligible")
    expect(popup_reward_card_1.get_by_test_id(
        "staking-requirement")).to_have_text("-")
    expect(popup_reward_card_1.get_by_test_id(
        "average-position")).to_have_text("-")
    
    popup_reward_card_2 = reward_popup.get_by_test_id("active-rewards-card").nth(1)
    expect(popup_reward_card_2).to_be_visible()
    expect(popup_reward_card_2.get_by_test_id(
        "entity-scope")).to_have_text("Individual")
    expect(popup_reward_card_2.get_by_test_id(
        "locked-for")).to_have_text("1 epoch")
    expect(popup_reward_card_2.get_by_test_id(
        "reward-value")).to_have_text("100.00")
    expect(popup_reward_card_2.get_by_test_id(
        "distribution-strategy")).to_have_text("Pro rata")
    expect(popup_reward_card_2.get_by_test_id("dispatch-metric-info")).to_have_text(
        "Price maker fees paid • tDAI"
    )
    expect(popup_reward_card_2.get_by_test_id(
        "scope")).to_have_text("Eligible")
    expect(popup_reward_card_2.get_by_test_id(
        "staking-requirement")).to_have_text("-")
    expect(popup_reward_card_2.get_by_test_id(
        "average-position")).to_have_text("310.50")

