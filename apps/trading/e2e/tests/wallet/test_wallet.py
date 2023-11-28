import pytest
import re
import json
from playwright.sync_api import Page, expect, Route
from vega_sim.service import VegaService
from conftest import init_vega
from fixtures.market import setup_continuous_market

order_size = "order-size"
order_price = "order-price"
place_order = "place-order"
order_side_sell = "order-side-SIDE_SELL"
market_order = "order-type-Market"
tif = "order-tif"
expire = "expire"


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture(scope="module")
def continuous_market(vega):
    return setup_continuous_market(vega)

def handle_route_connection_lost(route: Route, request):
        if request.method == "POST" and re.match(r"http://localhost:\d+/api/v2/requests", request.url):
            route.fulfill(
                status=200,
                headers={"Content-Type": "application/json"},
                body='{"jsonrpc": "2.0", "id": "1"}'
            )
        else:
            route.continue_()

def handle_route_connection_rejected(route: Route, request):
        if request.method == "POST" and re.match(r"http://localhost:\d+/api/v2/requests", request.url):
            custom_response = {
                "jsonrpc": "2.0",
                "error": {
                    "code": 3001,
                    "data": "the user rejected the wallet connection",
                    "message": "User error"
                },
                "id": "0"
            }
            route.fulfill(
                status=400,
                headers={"Content-Type": "application/json"},
                body=json.dumps(custom_response)
            )
        else:
            route.continue_()

def assert_connection_approve(route: Route, request, page:Page):
        if request.method == "POST" and re.match(r"http://localhost:\d+/api/v2/requests", request.url):
            expect(page.get_by_test_id("toast-content")).to_have_text("Please go to your Vega wallet application and approve or reject the transaction.")
        else:
            route.continue_()

@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_wallet_connection_error(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.route("**/*", handle_route_connection_lost)
    page.get_by_test_id("connect-vega-wallet").click()
    page.get_by_test_id("connector-jsonRpc").click()
    expect(page.get_by_test_id("wallet-dialog-title")).to_have_text("Something went wrong")

@pytest.mark.usefixtures("page", "risk_accepted")
def test_wallet_connection_rejected(continuous_market, page: Page):
    # 0002-WCON-002
    # 0002-WCON-005
    # 0002-WCON-007
    # 0002-WCON-015
    page.goto(f"/#/markets/{continuous_market}")
    page.route("**/*", handle_route_connection_rejected)
    page.get_by_test_id("connect-vega-wallet").click()
    page.get_by_test_id("connector-jsonRpc").click()
    expect(page.get_by_test_id("dialog-content").nth(1)).to_have_text("User errorthe user rejected the wallet connectionTry againAbout the Vega wallet  | Supported browsers ")


@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_wallet_connection_error_transaction(continuous_market, vega: VegaService, page: Page):
    # 0003-WTXN-009
    # 0003-WTXN-011
    # 0002-WCON-016
    # 0003-WTXN-008
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("120")
    page.route("**/*", handle_route_connection_lost)
    page.get_by_test_id(place_order).click()
    expect(page.get_by_test_id("toast-content")).to_have_text("Wallet disconnectedThe connection to your Vega Wallet has been lost.Connect vega wallet")
    
@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_wallet_transaction_rejected(continuous_market, vega: VegaService, page: Page):
    # 0003-WTXN-007
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("120")
    page.route("**/*", handle_route_connection_rejected)
    page.get_by_test_id(place_order).click()
    expect(page.get_by_test_id("toast-content")).to_have_text("Error occurredthe user rejected the wallet connection")
    
@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_wallet_connection_approve(continuous_market, vega: VegaService, page: Page):
    # 0002-WCON-005
    # 0002-WCON-007
    # 0002-WCON-009
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("120")
    page.route("**/*", assert_connection_approve)
    page.get_by_test_id(place_order).click()