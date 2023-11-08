import pytest
from playwright.sync_api import expect, Page
from vega_sim.service import VegaService

from actions.vega import submit_multiple_orders

@pytest.mark.skip("tbd")
@pytest.mark.usefixtures(
    "page", "vega", "opening_auction_market", "auth", "risk_accepted"
)
def test_trade_match_table(opening_auction_market: str, vega: VegaService, page: Page):
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

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    submit_multiple_orders(
        vega,
        "Key 1",
        opening_auction_market,
        "SIDE_BUY",
        [[5, 110], [5, 105], [1, 50]],
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    submit_multiple_orders(
        vega,
        "Key 1",
        opening_auction_market,
        "SIDE_SELL",
        [[5, 90], [5, 95], [1, 150]],
    )
    vega.forward("60s")
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
        "margin": "93.52953",
        "leverage": "1.0x",
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
    table = tab.locator(".ag-center-cols-container")

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
    expect(rows[0]).to_contain_text(
        "BTC:DAI_2023Futr" + "0" + "-1" + "Limit" + "Active" + "150.00" + "GTC"
    )
    expect(rows[1]).to_contain_text(
        "BTC:DAI_2023Futr" + "0" + "+1" + "Limit" + "Active" + "50.00" + "GTC"
    )
    expect(rows[2]).to_contain_text(
        "BTC:DAI_2023Futr" + "0" + "+5" + "Limit" + "Active" + "105.00" + "GTC"
    )

    # Closed
    page.get_by_test_id("Closed").click()
    rows = page.get_by_test_id("tab-closed-orders").locator(row_locator).all()
    expect(rows[0]).to_contain_text(
        "BTC:DAI_2023Futr" + "0" + "-5" + "Limit" + "Filled" + "95.00" + "GTC"
    )
    expect(rows[1]).to_contain_text(
        "BTC:DAI_2023Futr" + "5" + "-5" + "Limit" + "Filled" + "90.00" + "GTC"
    )
    expect(rows[2]).to_contain_text(
        "BTC:DAI_2023Futr" + "5" + "+5" + "Limit" + "Filled" + "110.00" + "GTC"
    )

    # Rejected
    page.get_by_test_id("Rejected").click()
    expect(
        page.get_by_test_id("tab-rejected-orders").locator(row_locator)
    ).to_contain_text(
        "BTC:DAI_2023Futr"
        + "0"
        + "+1"
        + "Limit"
        + "Rejected: Margin check failed"
        + "10,000,000,000,000,000.00"
        + "GTC"
    )

    # All
    page.get_by_test_id("All").click()
    rows = page.get_by_test_id("tab-orders").locator(row_locator).all()
    expect(rows[0]).to_contain_text(
        "BTC:DAI_2023Futr" + "0" + "-1" + "Limit" + "Active" + "150.00" + "GTC"
    )
    expect(rows[1]).to_contain_text(
        "BTC:DAI_2023Futr" + "5" + "-5" + "Limit" + "Filled" + "95.00" + "GTC"
    )
    expect(rows[2]).to_contain_text(
        "BTC:DAI_2023Futr" + "5" + "-5" + "Limit" + "Filled" + "90.00" + "GTC"
    )
    expect(rows[3]).to_contain_text(
        "BTC:DAI_2023Futr"
        + "0"
        + "+1"
        + "Limit"
        + "Rejected: Margin check failed"
        + "10,000,000,000,000,000.00"
        + "GTC"
    )
    expect(rows[4]).to_contain_text(
        "BTC:DAI_2023Futr" + "0" + "+1" + "Limit" + "Active" + "50.00" + "GTC"
    )
    expect(rows[5]).to_contain_text(
        "BTC:DAI_2023Futr" + "1" + "+5" + "Limit" + "Active" + "105.00" + "GTC"
    )
    expect(rows[6]).to_contain_text(
        "BTC:DAI_2023Futr" + "5" + "+5" + "Limit" + "Filled" + "110.00" + "GTC"
    )

    # Stop Orders
    page.get_by_test_id("Stop orders").click()
    expect(page.get_by_test_id("tab-stop-orders")).to_be_visible()
    expect(page.get_by_test_id("tab-stop-orders").locator(row_locator)).to_be_visible(
        visible=False
    )

    # Fills
    page.get_by_test_id("Fills").click()
    rows = page.get_by_test_id("tab-fills").locator(row_locator).all()
    expect(rows[0]).to_contain_text(
        "BTC:DAI_2023Futr"
        + "-5"
        + "106.50 tDAI"
        + "532.50 tDAI"
        + "Taker"
        + "53.51625 tDAI"
    )
    expect(rows[1]).to_contain_text(
        "BTC:DAI_2023Futr" + "+1" + "105.00 tDAI" + "105.00 tDAI" + "-" + "0.00 tDAI"
    )
    expect(rows[2]).to_contain_text(
        "BTC:DAI_2023Futr" + "+5" + "105.00 tDAI" + "525.00 tDAI" + "-" + "0.00 tDAI"
    )

    # Collateral
    page.get_by_test_id("Collateral").click()
    expect(
        page.get_by_test_id("tab-accounts").locator(".ag-floating-top-viewport .ag-row")
    ).to_contain_text("tDAI" + "43.94338" + "0.00%" + "999,904.04037" + "999,947.98375")
