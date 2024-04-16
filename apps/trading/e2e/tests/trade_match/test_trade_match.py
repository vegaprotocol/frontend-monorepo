import pytest
from playwright.sync_api import expect, Page
from vega_sim.null_service import VegaServiceNull
import time

from actions.vega import submit_multiple_orders


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_trade_match_table(
    opening_auction_market: str, vega: VegaServiceNull, page: Page
):
    row_locator = ".ag-center-cols-container .ag-row"
    page.goto(f"/#/markets/{opening_auction_market}")

    # sending order to be rejected, wait=False to avoid returning error from market-sim
    vega.submit_order(
        trading_key="Key 1",
        market_id=opening_auction_market,
        time_in_force="TIME_IN_FORCE_GTC",
        order_type="TYPE_LIMIT",
        side="SIDE_BUY",
        volume=1,
        price=10e15,
        wait=False,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    submit_multiple_orders(
        vega,
        "Key 1",
        opening_auction_market,
        "SIDE_BUY",
        [[5, 110], [5, 105], [1, 50]],
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    submit_multiple_orders(
        vega,
        "Key 1",
        opening_auction_market,
        "SIDE_SELL",
        [[5, 90], [5, 95], [1, 150]],
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # Positions
    position = {
        "market_code": "BTC:DAI_2023",
        "settlement_asset": "tDAI",
        "product_type": "Futr",
        "size": "+2",
        "notional": "220.00",
        "average_entry_price": "110.00",
        "mark_price": "110.00",
        "margin": "93.85953",
        "leverage": "Cross1.0x",
        "liquidation": "0.00",
        "realised_pnl": "0.00",
        "unrealised_pnl": "0.00",
    }
    page.goto(f"/#/markets/{opening_auction_market}")
    # 7004-POSI-001
    # 7004-POSI-002
    primary_id = "stack-cell-primary"
    secondary_id = "stack-cell-secondary"

    tab = page.get_by_test_id("tab-positions")
    table = tab.locator(".ag-body-viewport")
    market = table.locator("[col-id='marketCode']")
    expect(market.get_by_test_id(primary_id)).to_have_text(position["market_code"])
    expect(market.get_by_test_id(secondary_id)).to_have_text(
        position["settlement_asset"] + position["product_type"]
    )
    size_and_notional = table.locator("[col-id='openVolume']")
    expect(size_and_notional.get_by_test_id(primary_id)).to_have_text(position["size"])
    expect(size_and_notional.get_by_test_id(secondary_id)).to_have_text(
        position["notional"]
    )

    entry_and_mark = table.locator("[col-id='markPrice']")
    expect(entry_and_mark.get_by_test_id(primary_id)).to_have_text(
        position["average_entry_price"]
    )
    expect(entry_and_mark.get_by_test_id(secondary_id)).to_have_text(
        position["mark_price"]
    )

    margin_and_leverage = table.locator("[col-id='margin']")
    expect(margin_and_leverage.get_by_test_id(primary_id)).to_have_text(
        position["margin"]
    )
    expect(margin_and_leverage.get_by_test_id(secondary_id)).to_have_text(
        position["leverage"]
    )
    liquidation = table.locator("[col-id='liquidationPrice']")
    expect(liquidation.get_by_test_id("liquidation-price")).to_have_text(
        position["liquidation"]
    )

    realisedPNL = table.locator("[col-id='realisedPNL']")
    expect(realisedPNL).to_have_text(position["realised_pnl"])

    unrealisedPNL = table.locator("[col-id='unrealisedPNL']")
    expect(unrealisedPNL).to_have_text(position["unrealised_pnl"])

    # Open
    page.get_by_test_id("Open").click()
    rows = page.get_by_test_id("tab-open-orders").locator(row_locator).all()
    expect(rows[0]).to_contain_text("0" + "-1" + "Limit" + "Active" + "150.00" + "GTC")
    expect(rows[1]).to_contain_text("0" + "+1" + "Limit" + "Active" + "50.00" + "GTC")
    expect(rows[2]).to_contain_text("0" + "+5" + "Limit" + "Active" + "105.00" + "GTC")


    # Order history
    page.get_by_test_id("Order history").click()    
    rows = page.locator(row_locator).all()
    expect(rows[0]).to_contain_text(
        "0" + "-5" + "Limit" + "Stopped: Self trading" + "95.00" + "GTC"
    )
    expect(rows[1]).to_contain_text(
        "0" + "-5" + "Limit"     + "Stopped: Self trading" + "90.00" + "GTC"
    )

    expect(rows[2]).to_contain_text(
        "0"
        + "+1"
        + "Limit"
        + "Rejected: Margin check failed"
        + "10,000,000,000,000,000.00"
        + "GTC"
    )

    # Stop Orders
    page.get_by_test_id("Advanced orders").click()
    expect(page.get_by_test_id("tab-stop-orders")).to_be_visible()
    expect(page.get_by_test_id("tab-stop-orders").locator(row_locator)).to_be_visible(
        visible=False
    )

    # Trades
    page.get_by_test_id("Trades").nth(1).click()
    rows = page.locator(row_locator).all()
    expect(rows[0]).to_contain_text(
        "+1" + "110.00 tDAI" + "110.00 tDAI" + "-" + "0.00 tDAI"
    )
    expect(rows[1]).to_contain_text(
        "+1" + "110.00 tDAI" + "110.00 tDAI" + "-" + "0.00 tDAI"
    )

    # Collateral
    page.get_by_test_id("Collateral").click()
    expect(
        page.get_by_test_id("tab-accounts").locator(".ag-floating-top-viewport .ag-row")
    ).to_contain_text("93.85953" + "0.01%" + "999,906.14047" + "1,000,000.00")
