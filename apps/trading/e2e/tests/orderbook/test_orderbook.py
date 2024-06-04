import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from typing import List
from actions.vega import submit_order, submit_liquidity, submit_multiple_orders
from conftest import init_vega, cleanup_container, init_page, risk_accepted_setup
from fixtures.market import setup_simple_market
from wallet_config import MM_WALLET, MM_WALLET2
from actions.utils import next_epoch
from typing import Generator, Tuple


@pytest.fixture(scope="module")
def setup_environment(request, browser) -> Generator[Tuple[Page, VegaServiceNull, str], None, None]:
    # Setup Vega instance and perform cleanup after the test module
    with init_vega(request) as vega:
        request.addfinalizer(lambda: cleanup_container(vega))

        # Setup the market using the Vega instance
        market_id = setup_simple_market(vega)

        # Perform additional market setup tasks
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

        # Wait for the setup to be reflected in Vega
        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        with init_page(vega, browser, request) as page:
                risk_accepted_setup(page)
                yield page, vega, market_id


# these values don't align with the multiple orders above as
# creating a trade triggers the liquidity provision
orderbook_content = [
    [130.00500, 10, 126],
    [130.00000, 3, 116],
    [120.00000, 7, 113],
    [110.00000, 5, 106],
    [105.00000, 2, 101],
    [101.00000, 99, 99],
    # mid
    [99.00000, 99, 99],
    [95.00000, 3, 102],
    [90.00000, 3, 105],
    [85.00000, 5, 110],
    [70.00000, 5, 115],
    [69.99500, 10, 125],
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



def test_orderbook_grid_content(setup_environment: Tuple[Page, VegaServiceNull, str],
    ) -> None:
    page, vega, market_id = setup_environment

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

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    next_epoch(vega)

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
        float(page.locator("[data-testid*=current-price]").text_content())
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



def test_orderbook_resolution_change(setup_environment: Tuple[Page, VegaServiceNull, str],
    ) -> None:
    page, vega, market_id = setup_environment
    # 6003-ORDB-008
    orderbook_content_0_01 = [
        [130.01, 10, 126],
        [130.00, 3, 116],
        [120.00, 7, 113],
        [110.00, 5, 106],
        [105.00, 2, 101],
        [101.00, 99, 99],
        # mid
        [99.00, 99, 99],
        [95.00, 3, 102],
        [90.00, 3, 105],
        [85.00, 5, 110],
        [70.00, 15, 125],
    ]

    orderbook_content_1 = [
        [130, 13, 126],
        [120, 7, 113],
        [110, 5, 106],
        [105, 2, 101],
        [101, 99, 99],
        # mid
        [99, 99, 99],
        [95, 3, 102],
        [90, 3, 105],
        [85, 5, 110],
        [70, 15, 125],
    ]


    resolutions = [
        ["0.01", orderbook_content_0_01],
        ["1", orderbook_content_1],
    ]

    page.goto(f"/#/markets/{market_id}")
    for resolution in resolutions:
        page.get_by_test_id("resolution").click()
        page.get_by_role("menuitem").get_by_text(resolution[0], exact=True).click()
        verify_orderbook_grid(page, resolution[1])


def test_orderbook_price_size_copy(setup_environment: Tuple[Page, VegaServiceNull, str],
    ) -> None:
    page, vega, market_id = setup_environment
    # 6003-ORDB-009
    page.get_by_test_id("resolution").click()
    page.get_by_role("menuitem").get_by_text("0.00001", exact=True).click()
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



def test_orderbook_price_movement(setup_environment: Tuple[Page, VegaServiceNull, str],
    ) -> None:
    page, vega, market_id = setup_environment

    page.goto(f"/#/markets/{market_id}")
    page.pause()
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

    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # 6003-ORDB-013
    page.pause()
    expect(book_el.locator("[data-testid=icon-arrow-up]")).to_be_attached()
    assert (
        float(page.locator("[data-testid*=current-price]").text_content())
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

    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    expect(book_el.locator("[data-testid=icon-arrow-down]")).to_be_attached()
    page.pause()
    assert (
        float(page.locator("[data-testid*=current-price]").text_content())
        == matching_order_2[1]
    )
