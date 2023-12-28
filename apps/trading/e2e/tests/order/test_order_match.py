import pytest
import re
import logging
from playwright.sync_api import expect, Page
from vega_sim.null_service import VegaServiceNull
from playwright.sync_api import expect
from actions.vega import submit_order

logger = logging.getLogger()


# Could be turned into a helper function in the future.
def verify_data_grid(page: Page, data_test_id, expected_pattern):
    page.get_by_test_id(data_test_id).click()
    # Required so that we can get liquidation price
    expect(
        page.locator(
            f'[data-testid^="tab-{data_test_id.lower()}"] >> .ag-center-cols-container .ag-row-first'
        ).first
    ).to_be_visible()
    actual_text = page.locator(
        f'[data-testid^="tab-{data_test_id.lower()}"] >> .ag-center-cols-container .ag-row-first'
    ).first.text_content()
    lines = actual_text.strip().split("\n")
    for expected, actual in zip(expected_pattern, lines):
        # We are using regex so that we can run tests in different timezones.
        if re.match(r"^\\d", expected):  # check if it's a regex
            if re.search(expected, actual):
                logger.info(f"Matched: {expected} == {actual}")
            else:
                logger.info(f"Not Matched: {expected} != {actual}")
                raise AssertionError(f"Pattern does not match: {expected} != {actual}")
        else:  # it's not a regex, so we escape it
            if re.search(re.escape(expected), actual):
                logger.info(f"Matched: {expected} == {actual}")
            else:
                logger.info(f"Not Matched: {expected} != {actual}")
                raise AssertionError(f"Pattern does not match: {expected} != {actual}")


def submit_order(vega: VegaServiceNull, wallet_name, market_id, side, volume, price):
    vega.submit_order(
        trading_key=wallet_name,
        market_id=market_id,
        time_in_force="TIME_IN_FORCE_GTC",
        order_type="TYPE_LIMIT",
        side=side,
        volume=volume,
        price=price,
    )


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_order_trade_open_order(
    opening_auction_market, vega: VegaServiceNull, page: Page
):
    market_id = opening_auction_market
    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 1, 110)

    page.goto(f"/#/markets/{market_id}")
    # Assert that the user order is displayed on the orderbook
    orderbook_trade = page.get_by_test_id("price-11000000").nth(1)
    # 6003-ORDB-001
    # 6003-ORDB-002
    expect(orderbook_trade).to_be_visible()

    expected_open_order = [
        "BTC:DAI_2023",
        "+1",
        "Limit",
        "Active",
        "0/1",
        "110.00",
        "Good 'til Cancelled (GTC)",
        r"\d{1,2}/\d{1,2}/\d{4},\s*\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM)",
        "-",
    ]
    logger.info("Assert Open orders:")
    verify_data_grid(page, "Open", expected_open_order)


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_order_trade_open_position(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")

    primary_id = "stack-cell-primary"
    secondary_id = "stack-cell-secondary"

    position = {
        "market_code": "BTC:DAI_2023",
        "settlement_asset": "tDAI",
        "product_type": "Futr",
        "size": "+1",
        "notional": "107.50",
        "average_entry_price": "107.50",
        "mark_price": "107.50",
        "margin": "8.50269",
        "leverage": "1.0x",
        "liquidation": "0.00",
        "realised_pnl": "0.00",
        "unrealised_pnl": "0.00",
    }

    tab = page.get_by_test_id("tab-positions")
    table = tab.locator(".ag-center-cols-container")

    # 7004-POSI-001
    # 7004-POSI-002

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


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_order_trade_order_trade_away(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    # Assert that the order is no longer on the orderbook
    page.get_by_test_id("Orderbook").click()
    price_element = page.get_by_test_id("price-11000000").nth(1)
    # 6003-ORDB-010
    print(price_element)
    expect(price_element).to_be_hidden()
