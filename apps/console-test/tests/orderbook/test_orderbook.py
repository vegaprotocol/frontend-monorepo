import pytest
from collections import namedtuple
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from typing import List
from actions.vega import submit_order, submit_liquidity, submit_multiple_orders
from conftest import init_vega
from fixtures.market import setup_simple_market

# Defined namedtuples
WalletConfig = namedtuple("WalletConfig", ["name", "passphrase"])

# Wallet Configurations
MM_WALLET = WalletConfig("mm", "pin")
MM_WALLET2 = WalletConfig("mm2", "pin2")


@pytest.fixture(scope="module")
def vega():
    with init_vega() as vega:
        yield vega


@pytest.fixture(scope="module")
def setup_market(vega):
    market_id = setup_simple_market(vega)
    submit_liquidity(vega, MM_WALLET.name, market_id)
    submit_multiple_orders(
        vega,
        MM_WALLET.name,
        market_id,
        "SIDE_SELL",
        [[10, 130.005], [3, 130], [7, 120], [5, 110], [2, 105]],
    )
    submit_multiple_orders(
        vega,
        MM_WALLET2.name,
        market_id,
        "SIDE_BUY",
        [[10, 69.995], [5, 70], [5, 85], [3, 90], [3, 95]],
    )

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    return [
        vega,
        market_id,
    ]


# these values don't align with the multiple orders above as
# creating a trade triggers the liquidity provision
orderbook_content = [
    [130.00500, 10, 94],
    [130.00000, 3, 84],
    [120.00000, 7, 81],
    [110.00000, 5, 74],
    [105.00000, 2, 69],
    [101.00000, 67, 67],
    # mid
    [99.00000, 102, 102],
    [95.00000, 3, 105],
    [90.00000, 3, 108],
    [85.00000, 5, 113],
    [70.00000, 5, 118],
    [69.99500, 10, 128],
]


def verify_orderbook_grid(
    page: Page, content: List[List[float]], last_trade_price: float = False
):
    rows = page.locator("[data-testid$=-rows-container]").all()
    for row_index, content_row in enumerate(content):
        cells = rows[row_index].locator("button").all()
        for cell_index, content_cell in enumerate(content_row):
            assert float(cells[cell_index].text_content()) == content_cell


def verify_prices_descending(page: Page):
    prices_locator = page.get_by_test_id("tab-orderbook").locator(
        '[data-testid^="price-"]'
    )
    prices_locator.first.wait_for(state="visible")
    prices = [float(price.text_content()) for price in prices_locator.all()]
    assert prices == sorted(prices, reverse=True)

@pytest.mark.skip("tbd")
@pytest.mark.usefixtures("page", "risk_accepted")
def test_orderbook_grid_content(setup_market, page: Page):
    vega = setup_market[0]
    market_id = setup_market[1]

    # Create a so that lastTradePrice is shown in the mid section
    # of the book
    matching_order = [1, 100]
    submit_order(
        vega,
        MM_WALLET.name,
        market_id,
        "SIDE_SELL",
        matching_order[0],
        matching_order[1],
    )
    submit_order(
        vega,
        MM_WALLET2.name,
        market_id,
        "SIDE_BUY",
        matching_order[0],
        matching_order[1],
    )

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # 6003-ORDB-001
    # 6003-ORDB-002
    # 6003-ORDB-003
    # 6003-ORDB-004
    # 6003-ORDB-005
    # 6003-ORDB-006
    # 6003-ORDB-007
    page.goto(f"/#/markets/{market_id}")

    page.locator("[data-testid=Orderbook]").click()

    # 6003-ORDB-013
    assert (
        float(page.locator("[data-testid*=last-traded]").text_content())
        == matching_order[1]
    )

    # 6003-ORDB-011
    # get the spread text trimming off the parentheses on either end
    spread_text = page.locator("[data-testid=spread]").text_content()[1:-1]
    assert (
        # TODO: figure out how to not have hardcoded value
        spread_text
        == "2.00"
    )

    verify_orderbook_grid(page, orderbook_content)
    verify_prices_descending(page)


@pytest.mark.usefixtures("page", "risk_accepted")
def test_orderbook_resolution_change(setup_market, page: Page):
    market_id = setup_market[1]
    # 6003-ORDB-008
    orderbook_content_0_00 = [
        [130.01, 10, 94],
        [130.00, 3, 84],
        [120.00, 7, 81],
        [110.00, 5, 74],
        [105.00, 2, 69],
        [101.00, 67, 67],
        # mid
        [99.00, 102, 102],
        [95.00, 3, 105],
        [90.00, 3, 108],
        [85.00, 5, 113],
        [70.00, 15, 128],
    ]

    orderbook_content_10 = [
        [130, 13, 94],
        [120, 7, 81],
        [110, 7, 74],
        [100, 67, 67],
        # mid
        [100, 105, 105],
        [90, 8, 113],
        [70, 15, 128],
    ]

    orderbook_content_100 = [
        [100, 94, 94],
        # mid
        [100, 128, 128],
    ]

    resolutions = [
        ["0.00", orderbook_content_0_00],
        ["10", orderbook_content_10],
        ["100", orderbook_content_100],
    ]

    page.goto(f"/#/markets/{market_id}")
    # temporary skip
    # for resolution in resolutions:
    #     page.get_by_test_id("resolution").click()
    #     page.get_by_role("menu").get_by_text(resolution[0], exact=True).click()
    #     verify_orderbook_grid(page, resolution[1])


@pytest.mark.usefixtures("page", "risk_accepted")
def test_orderbook_price_size_copy(setup_market, page: Page):
    market_id = setup_market[1]
    # 6003-ORDB-009
    prices = page.get_by_test_id("tab-orderbook").locator('[data-testid^="price-"]')
    volumes = page.get_by_test_id("tab-orderbook").locator('[data-testid*="-vol-"]')

    page.goto(f"/#/markets/{market_id}")
    prices.first.wait_for(state="visible")

    for price in prices.all():
        price.click()
        expect(page.get_by_test_id("order-price")).to_have_value(price.text_content())

    for volume in volumes.all():
        volume.click()
        expect(page.get_by_test_id("order-size")).to_have_value(volume.text_content())

@pytest.mark.skip("tbd")
@pytest.mark.usefixtures("page", "risk_accepted")
def test_orderbook_price_movement(setup_market, page: Page):
    vega = setup_market[0]
    market_id = setup_market[1]

    page.goto(f"/#/markets/{market_id}")
    page.locator("[data-testid=Orderbook]").click()

    book_el = page.locator("[data-testid=orderbook-grid-element]")

    # no arrow shown on load
    expect(book_el.locator("[data-testid^=icon-arrow]")).not_to_be_attached()

    matching_order_1 = [1, 101]
    submit_order(
        vega,
        MM_WALLET2.name,
        market_id,
        "SIDE_BUY",
        matching_order_1[0],
        matching_order_1[1],
    )

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # 6003-ORDB-013
    expect(book_el.locator("[data-testid=icon-arrow-up]")).to_be_attached()
    assert (
        float(page.locator("[data-testid*=last-traded]").text_content())
        == matching_order_1[1]
    )

    matching_order_2 = [1, 99]
    submit_order(
        vega,
        MM_WALLET2.name,
        market_id,
        "SIDE_SELL",
        matching_order_2[0],
        matching_order_2[1],
    )

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    expect(book_el.locator("[data-testid=icon-arrow-down]")).to_be_attached()

    assert (
        float(page.locator("[data-testid*=last-traded]").text_content())
        == matching_order_2[1]
    )
