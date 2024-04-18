import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from actions.utils import wait_for_toast_confirmation
from wallet_config import MM_WALLET, MM_WALLET2, PARTY_A, PARTY_B


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_take_profit_stop_loss_deal_ticket(
    continuous_market, page: Page, vega: VegaServiceNull
):
    # 7002-SORD-032
    page.goto(f"/#/markets/{continuous_market}")
    tdai_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(
        PARTY_A.name,
        asset=tdai_id,
        amount=10e5,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    vega.mint(
        PARTY_B.name,
        asset=tdai_id,
        amount=10e5,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id("tpSl").click()
    page.get_by_test_id("order-size").fill("1")
    page.get_by_test_id("order-price").fill("100")
    page.get_by_test_id("order-price-stop-loss").fill("95")
    page.get_by_test_id("order-price-take-profit").fill("200")
    page.get_by_test_id("place-order").click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id("Open").click()
    expect(page.get_by_role("row").nth(4)).to_contain_text("0+1LimitActive100.00GTC")
    page.get_by_test_id("Advanced orders").click()
    text_locator_mark_under_95_pending = "Mark < 95.00-1MarketPendingOCO-FOK"
    text_locator_mark_over_200_pending = "Mark > 200.00-1MarketPendingOCO-FOK"

    expect(page.locator(f"text={text_locator_mark_under_95_pending}")).to_be_visible()
    expect(page.locator(f"text={text_locator_mark_over_200_pending}")).to_be_visible()

    submit_order(vega, PARTY_A.name, continuous_market, "SIDE_SELL", 100, 90)
    submit_order(vega, PARTY_B.name, continuous_market, "SIDE_BUY", 100, 90)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.get_by_test_id("Order history").click()
    expect(page.get_by_role("row").nth(5)).to_contain_text("1+1LimitFilled100.00GTC")
    submit_order(vega, MM_WALLET.name, continuous_market, "SIDE_SELL", 100, 80)
    submit_order(vega, MM_WALLET2.name, continuous_market, "SIDE_BUY", 100, 90)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id("Order history").click()
    expect(page.get_by_role("row").nth(8)).to_contain_text("1-1MarketFilled-FOK")
    page.get_by_test_id("Advanced orders").click()
    text_locator_mark_under_95_triggered = "Mark < 95.00-1MarketTriggeredOCO-FOK"
    text_locator_mark_over_200_stopped = "Mark > 200.00-1MarketStoppedOCO-FOK"

    expect(page.locator(f"text={text_locator_mark_under_95_triggered}")).to_be_visible()
    expect(page.locator(f"text={text_locator_mark_over_200_stopped}")).to_be_visible()
