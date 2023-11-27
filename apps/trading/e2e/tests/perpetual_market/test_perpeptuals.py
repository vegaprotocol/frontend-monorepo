import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.vega import submit_multiple_orders
from wallet_config import MM_WALLET, MM_WALLET2


@pytest.mark.usefixtures("vega", "page", "perps_market", "risk_accepted", "auth")
def test_funding_payment(perps_market, vega: VegaService, page: Page):
    page.goto(f"/#/markets/{perps_market}")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")


    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 120], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 130], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 125], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 160], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 95], [1, 110]]
    )
    vega.forward("30s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 80], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    vega.forward("30s")


    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 120], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 130], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 125], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 160], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 115]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 80], [1, 80]]
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_multiple_orders(
        vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 115], [1, 90]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 95], [1, 110]]
    )
    vega.forward("30s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.pause()
    expect()