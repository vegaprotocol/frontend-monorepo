import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.vega import submit_order
from actions.utils import wait_for_toast_confirmation

notional = "deal-ticket-fee-notional"
fees = "deal-ticket-fee-fees"
margin_required = "deal-ticket-fee-margin-required"
item_value = "item-value"
market_trading_mode = "market-trading-mode"


@pytest.mark.skip("tbd")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_margin_and_fees_estimations(continuous_market, vega: VegaService, page: Page):
    # setup continuous trading market with one user buy trade
    market_id = continuous_market
    page.goto(f"/#/markets/{market_id}")

    # submit order from UI and verify fees and margin
    expect(page.get_by_test_id(notional)).to_have_text("Notional- BTC")
    expect(page.get_by_test_id(fees)).to_have_text("Fees- tDAI")
    expect(page.get_by_test_id(margin_required)).to_have_text(
        "Margin required0.00 tDAI"
    )
    page.get_by_test_id("order-size").type("200")
    page.get_by_test_id("order-price").type("20")

    expect(page.get_by_test_id(notional)).to_have_text("Notional4,000.00 BTC")
    expect(page.get_by_test_id(fees)).to_have_text("Fees~402.00 tDAI")
    expect(page.get_by_test_id(margin_required)).to_have_text(
        "Margin required1,661.88832 tDAI"
    )

    page.get_by_test_id("place-order").click()
    wait_for_toast_confirmation(page)
    vega.forward("10s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    expect(page.get_by_test_id(margin_required)).to_have_text(
        "Margin required1,661.88832 tDAI "
    )
    page.get_by_test_id("toast-close").click()

    # submit order by sim function
    order = submit_order(vega, "Key 1", market_id, "SIDE_BUY", 400, 38329483272398.838)
    vega.forward("20s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.get_by_test_id(margin_required)).to_have_text(
        "Margin required897,716,007,278,798.50 tDAI "
    )
    expect(page.get_by_test_id("deal-ticket-warning-margin")).to_contain_text(
        "You may not have enough margin available to open this position."
    )

    # cancel order and verify that warning margin disappeared
    vega.cancel_order("Key 1", market_id, order)
    vega.forward("20s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    expect(page.get_by_test_id("deal-ticket-warning-auction")).to_contain_text(
        "Any orders placed now will not trade until the auction ends"
    )

    # add order at the current price so that it is possible to change the status to price monitoring
    submit_order(vega, "Key 1", market_id, "SIDE_SELL", 1, 110)
    vega.forward("20s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    page.reload()
    expect(page.get_by_test_id(margin_required)).to_have_text(
        "Margin required1,700.53688 tDAI"
    )
    expect(
        page.get_by_test_id(market_trading_mode).get_by_test_id(item_value)
    ).to_have_text("Continuous")

    # verify if we can submit order after reverted margin
    page.get_by_test_id("place-order").click()
    wait_for_toast_confirmation(page)
    vega.forward("10s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    # skip temporary
    # expect(page.get_by_test_id("toast-content")).to_contain_text(
    #     "Your transaction has been confirmed"
    # )
