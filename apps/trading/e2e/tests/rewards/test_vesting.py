import pytest
import vega_sim.proto.vega as vega_protos
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.utils import next_epoch, change_keys
from wallet_config import MM_WALLET, PARTY_A, PARTY_B


@pytest.mark.usefixtures("risk_accepted", "auth")
def test_vesting(continuous_market, vega: VegaServiceNull, page: Page):
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
    vega.wait_for_total_catchup()

    page.goto("/#/rewards")
    change_keys(page, vega, PARTY_B.name)
    next_epoch(vega=vega)
    page.reload()

    expect(page.get_by_test_id("locked-value")).to_have_text("50.00")
    
    # Proceed through the 5 epoch lock period
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    page.reload()

    expect(page.get_by_test_id("locked-value")).to_have_text("0.00")
    expect(page.get_by_test_id("vesting-value")).to_have_text("37.50")
    expect(page.get_by_test_id("available-to-withdraw-value")).to_have_text("12.50")
