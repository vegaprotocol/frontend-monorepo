import pytest
from typing import Tuple, Generator
from playwright.sync_api import Page, expect
from vega_sim.service import PeggedOrder
from actions.vega import submit_order
from fixtures.market import setup_continuous_market
from conftest import (
    init_vega,
    cleanup_container,
    init_page,
    auth_setup,
    risk_accepted_setup,
)
from wallet_config import MM_WALLET, MM_WALLET2


@pytest.fixture(scope="module")
def setup_environment(request, browser) -> Generator[Tuple[Page, str, str], None, None]:
    with init_vega(request) as vega:
        request.addfinalizer(lambda: cleanup_container(vega))

        market_id = setup_continuous_market(vega)

        vega.submit_order(
            trading_key="Key 1",
            market_id=market_id,
            time_in_force="TIME_IN_FORCE_GTC",
            order_type="TYPE_LIMIT",
            side="SIDE_BUY",
            volume=10,
            price=60,
            pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_MID", offset=1),
        )
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        vega.submit_liquidity(
            key_name=MM_WALLET.name,
            market_id=market_id,
            commitment_amount=100,
            fee=0.002,
            is_amendment=False,
        )

        vega.submit_order(
            market_id=market_id,
            trading_key=MM_WALLET.name,
            side="SIDE_BUY",
            order_type="TYPE_LIMIT",
            price=1 - 0.0005,
            wait=False,
            time_in_force="TIME_IN_FORCE_GTC",
            volume=99,
        )
        vega.submit_order(
            market_id=market_id,
            trading_key=MM_WALLET.name,
            side="SIDE_SELL",
            order_type="TYPE_LIMIT",
            price=1 + 0.0005,
            wait=False,
            time_in_force="TIME_IN_FORCE_GTC",
            volume=99,
        )

        # add orders to provide liquidity
        submit_order(vega, MM_WALLET.name, market_id, "SIDE_BUY", 1, 1)
        submit_order(vega, MM_WALLET.name, market_id, "SIDE_SELL", 1, 1)
        submit_order(
            vega,
            MM_WALLET.name,
            market_id,
            "SIDE_BUY",
            1,
            1 + 0.1 / 2,
        )
        submit_order(vega, MM_WALLET.name, market_id, "SIDE_SELL", 1, 1 + 0.1 / 2)
        submit_order(vega, MM_WALLET2.name, market_id, "SIDE_SELL", 1, 1)

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        # add orders that change the price so that it goes beyond the limits of price monitoring
        submit_order(vega, MM_WALLET.name, market_id, "SIDE_SELL", 100, 300)
        submit_order(vega, MM_WALLET2.name, market_id, "SIDE_BUY", 100, 290)
        submit_order(vega, MM_WALLET.name, market_id, "SIDE_SELL", 100, 305)
        submit_order(vega, MM_WALLET2.name, market_id, "SIDE_BUY", 100, 295)
        submit_order(vega, MM_WALLET2.name, market_id, "SIDE_BUY", 1, 305)

        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        with init_page(vega, browser, request) as page:
            risk_accepted_setup(page)
            auth_setup(vega, page)
            page.goto(market_id)
            yield page, market_id


def test_parked_order(
    setup_environment: Tuple[Page, str, str],
) -> None:
    (
        page,
        market_id,
    ) = setup_environment
    page.goto(f"/#/markets/{market_id}")
    page.get_by_test_id("Open").click()
    expect(page.get_by_role("row").nth(4)).to_contain_text(
        "0+10Mid - 1.00 Peg limitParked0.00GTC"
    )


def test_trading_mode(
    setup_environment: Tuple[Page, str, str],
) -> None:
    (
        page,
        market_id,
    ) = setup_environment
    page.goto(f"/#/markets/{market_id}")
    expect(page.get_by_test_id("market-trading-mode")).to_have_text(
        "Trading modeMonitoring auction - price"
    )
    expect(page.get_by_test_id("market-state")).to_have_text("StatusSuspended")


def test_market_info_price_monitoring_asd(
    setup_environment: Tuple[Page, str, str],
) -> None:
    (
        page,
        market_id,
    ) = setup_environment
    page.goto(f"/#/markets/{market_id}")
    page.get_by_test_id("Info").click()
    page.get_by_test_id("accordion-title").get_by_text("Key details").click()
    expect(page.get_by_test_id("key-value-table-row").nth(2)).to_contain_text(
        "Suspended"
    )
    expect(page.get_by_test_id("key-value-table-row").nth(3)).to_contain_text(
        "Monitoring auction"
    )
