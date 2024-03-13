import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import PeggedOrder
from conftest import (
    auth_setup,
    init_page,
    init_vega,
    risk_accepted_setup,
    cleanup_container,
)
from fixtures.market import setup_continuous_market
from actions.utils import wait_for_toast_confirmation

order_tab = "tab-orders"


@pytest.fixture(scope="module")
def setup_environment(request, browser):
    # Initialize Vega with cleanup
    with init_vega(request) as vega:
        request.addfinalizer(lambda: cleanup_container(vega))

        market_id = setup_continuous_market(vega, custom_market_name="market-1")

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_IOC",
            order_type="TYPE_LIMIT",
            side="SIDE_SELL",
            volume=100,
            price=130,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_GTC",
            order_type="TYPE_LIMIT",
            side="SIDE_SELL",
            volume=100,
            price=88,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_IOC",
            order_type="TYPE_LIMIT",
            side="SIDE_SELL",
            volume=100,
            price=88,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_GTC",
            order_type="TYPE_LIMIT",
            side="SIDE_SELL",
            volume=1e10,
            price=130,
            wait=False,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_IOC",
            order_type="TYPE_LIMIT",
            side="SIDE_BUY",
            volume=100,
            price=104,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_GTT",
            order_type="TYPE_LIMIT",
            side="SIDE_SELL",
            volume=10,
            price=120,
            expires_at=vega.get_blockchain_time() + 5 * 1e9,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            market_id=market_id,
            trading_key="Key 1",
            side="SIDE_BUY",
            order_type="TYPE_LIMIT",
            pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_MID", offset=5),
            time_in_force="TIME_IN_FORCE_GTC",
            volume=20,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            market_id=market_id,
            trading_key="Key 1",
            side="SIDE_BUY",
            order_type="TYPE_LIMIT",
            pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_BEST_BID", offset=10),
            time_in_force="TIME_IN_FORCE_GTC",
            volume=40,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            market_id=market_id,
            trading_key="Key 1",
            side="SIDE_SELL",
            order_type="TYPE_LIMIT",
            pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_BEST_ASK", offset=15),
            time_in_force="TIME_IN_FORCE_GTC",
            volume=60,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            market_id=market_id,
            trading_key="Key 1",
            side="SIDE_SELL",
            order_type="TYPE_LIMIT",
            pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_BEST_ASK", offset=15),
            wait=False,
            time_in_force="TIME_IN_FORCE_GTC",
            volume=60,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_GTC",
            order_type="TYPE_LIMIT",
            side="SIDE_SELL",
            volume=10,
            price=150,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_GTC",
            order_type="TYPE_LIMIT",
            side="SIDE_SELL",
            volume=10,
            price=160,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_GTC",
            order_type="TYPE_LIMIT",
            side="SIDE_BUY",
            volume=10,
            price=60,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        yield vega, market_id


@pytest.fixture(scope="module")
def page(setup_environment, browser, request):
    vega, market_id = setup_environment
    with init_page(vega, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega, page)
        page.goto("/")
        page.get_by_test_id("All").click()
        yield page


@pytest.fixture(autouse=True)
def after_each(page: Page):
    yield
    if page.get_by_test_id("toast-close").is_visible():
        page.get_by_test_id("toast-close").click()


#  7002-SORD-040 (as all the tests are about status)


def test_order_status_active(page: Page):
    # 7002-SORD-041
    expect(page.locator('[row-index="2"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="2"]').nth(1)).to_contain_text(
        "0" + "-10" + "Limit" + "Active" + "150.00" + "GTC"
    )


def test_status_expired(page: Page):
    # 7002-SORD-042
    expect(page.locator('[row-index="7"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="7"]').nth(1)).to_contain_text(
        "0" + "-10" + "Limit" + "Expired" + "120.00" + "GTT:"
    )


def test_order_status_Stopped(page: Page):
    # 7002-SORD-044
    expect(page.locator('[row-index="12"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="12"]').nth(1)).to_contain_text(
        "0" + "-100" + "Limit" + "Stopped" + "130.00" + "IOC"
    )


def test_order_status_partially_filled(page: Page):
    # 7002-SORD-045
    page.pause()
    expect(page.locator('[row-index="10"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="10"]').nth(1)).to_contain_text(
        "1" + "-100" + "Limit" + "Partially Filled" + "88.00" + "IOC"
    )


def test_order_status_filled(page: Page):
    # 7002-SORD-046
    # 7003-MORD-020
    expect(page.locator('[row-index="11"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="11"]').nth(1)).to_contain_text(
        "100" + "-100" + "Limit" + "Filled" + "88.00" + "GTC"
    )


def test_order_status_rejected(page: Page):
    # 7002-SORD-047
    # 7003-MORD-018
    expect(page.locator('[row-index="9"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="9"]').nth(1)).to_contain_text(
        "0"
        + "-10,000,000,000"
        + "Limit"
        + "Rejected: Margin check failed"
        + "130.00"
        + "GTC"
    )


def test_order_status_pegged_ask(page: Page):
    #  7003-MORD-016
    expect(page.locator('[row-index="4"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="4"]').nth(1)).to_contain_text(
        "0" + "-60" + "Ask + 15.00 Peg limit" + "Active" + "125.00" + "GTC"
    )


def test_order_status_pegged_bid(page: Page):
    #  7003-MORD-016
    expect(page.locator('[row-index="5"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="5"]').nth(1)).to_contain_text(
        "0" + "+40" + "Bid - 10.00 Peg limit" + "Active" + "50.00" + "GTC"
    )


def test_order_status_pegged_mid(page: Page):
    #  7003-MORD-016
    expect(page.locator('[row-index="6"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="6"]').nth(1)).to_contain_text(
        "0" + "+20" + "Mid - 5.00 Peg limit" + "Active" + "80.00" + "GTC"
    )


def test_order_amend_order(setup_environment, page: Page):
    vega, markets = setup_environment
    #  7002-SORD-053
    #  7003-MORD-012
    #  7003-MORD-014
    #  7003-MORD-015
    page.get_by_test_id("edit").nth(1).click()
    page.locator("#limitPrice").fill("170")
    page.locator("#size").fill("15")
    page.get_by_role("button", name="Update").click()

    wait_for_toast_confirmation(page, timeout=5000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.locator('[row-index="1"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="1"]').nth(1)).to_contain_text(
        "0" + "-15" + "Limit" + "Active" + "170.00" + "GTC"
    )


def test_order_cancel_single_order(setup_environment, page: Page):
    vega, markets = setup_environment
    #  7003-MORD-009
    #  7003-MORD-010
    #  7003-MORD-011
    #  7002-SORD-043
    page.get_by_test_id("cancel").first.click()
    wait_for_toast_confirmation(page, timeout=5000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.locator('[row-index="0"]').first).to_contain_text("market-1Futr")
    expect(page.locator('[row-index="0"]').nth(1)).to_contain_text(
        "0" + "+10" + "Limit" + "Cancelled" + "60.00" + "GTC"
    )


def test_order_cancel_all_orders(setup_environment, page: Page):
    vega, markets = setup_environment
    #  7003-MORD-009
    #  7003-MORD-010
    #  7003-MORD-011
    #  7002-SORD-043

    page.get_by_test_id("cancelAll").click()

    wait_for_toast_confirmation(page, timeout=5000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    expect(page.get_by_test_id("cancelAll")).not_to_be_visible()
    expect(page.get_by_test_id("cancel")).not_to_be_visible()
    expect(
        page.locator('.ag-cell[col-id="status"]', has_text="Cancelled")
    ).to_have_count(7)
