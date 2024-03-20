import pytest
import vega_sim.proto.vega as vega_protos
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.utils import next_epoch
from wallet_config import MM_WALLET, PARTY_A, PARTY_B
from vega_sim.service import MarketStateUpdateType
import vega_sim.api.governance as governance


@pytest.mark.usefixtures("risk_accepted", "auth")
def test_filtered_cards(continuous_market, vega: VegaServiceNull, page: Page):
    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.update_network_parameter(
        MM_WALLET.name, parameter="reward.asset", new_value=tDAI_asset_id
    )
    vega.mint(key_name=PARTY_B.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_A.name, asset=tDAI_asset_id, amount=100000)
    next_epoch(vega=vega)
    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
        reference="reward",
        markets=[continuous_market],
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        lock_period=5,
        amount=100,
        factor=1.0,
    )
    vega.submit_order(
        trading_key=PARTY_B.name,
        market_id=continuous_market,
        order_type="TYPE_MARKET",
        time_in_force="TIME_IN_FORCE_IOC",
        side="SIDE_BUY",
        volume=1,
    )
    vega.submit_order(
        trading_key=PARTY_A.name,
        market_id=continuous_market,
        order_type="TYPE_MARKET",
        time_in_force="TIME_IN_FORCE_IOC",
        side="SIDE_BUY",
        volume=1,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.goto("/#/rewards")

    vega.update_market_state(
        market_id=continuous_market,
        proposal_key=MM_WALLET.name,
        market_state=MarketStateUpdateType.Suspend,
        forward_time_to_enactment=True,
    )
    next_epoch(vega=vega)

    page.reload()
    expect(page.get_by_test_id("active-rewards-card")
           ).to_be_visible(timeout=15000)
    governance.submit_oracle_data(
        wallet=vega.wallet,
        payload={"trading.terminated": "true"},
        key_name="FJMKnwfZdd48C8NqvYrG",
    )
    next_epoch(vega=vega)
    page.reload()
    expect(page.get_by_test_id("active-rewards-card")).not_to_be_in_viewport()


@pytest.mark.usefixtures("risk_accepted", "auth")
def test_filtered_future_cards(continuous_market, vega: VegaServiceNull, page: Page):
    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.update_network_parameter(
        MM_WALLET.name, parameter="reward.asset", new_value=tDAI_asset_id
    )
    vega.mint(key_name=PARTY_B.name, asset=tDAI_asset_id, amount=100000)
    vega.mint(key_name=PARTY_A.name, asset=tDAI_asset_id, amount=100000)
    next_epoch(vega=vega)
    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=tDAI_asset_id,
        reference="reward",
        markets=[continuous_market],
        asset_for_metric=tDAI_asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        lock_period=5,
        amount=200,
        factor=1.0,
        start_epoch=10,
    )
    vega.submit_order(
        trading_key=PARTY_B.name,
        market_id=continuous_market,
        order_type="TYPE_MARKET",
        time_in_force="TIME_IN_FORCE_IOC",
        side="SIDE_BUY",
        volume=1,
    )
    vega.submit_order(
        trading_key=PARTY_A.name,
        market_id=continuous_market,
        order_type="TYPE_MARKET",
        time_in_force="TIME_IN_FORCE_IOC",
        side="SIDE_BUY",
        volume=1,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.goto("/#/rewards")
    card = page.get_by_test_id("active-rewards-card")
    expect(card).to_be_visible(timeout=15000)
    expect(page.get_by_test_id("starts-in")).to_have_text("6 epochs")
    color = card.evaluate("element => getComputedStyle(element).color")
    assert color == "rgb(4, 4, 5)", f"Unexpected color: {color}"
