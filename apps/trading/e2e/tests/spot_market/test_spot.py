import re
import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from fixtures.market import setup_spot_market
from conftest import init_page, init_vega, risk_accepted_setup, cleanup_container

market_title_test_id = "accordion-title"
market_accordion_content = "accordion-content"


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance


@pytest.fixture(scope="module")
def page(vega, browser, request):
    with init_page(vega, browser, request) as page:
        setup_spot_market(vega)
        risk_accepted_setup(page)
        page.goto("/")
        page.get_by_test_id("Info").click()
        yield page


@pytest.fixture(autouse=True)
def after_each(page: Page):
    yield
    opened_element = page.locator('[data-testid="market-info-accordion"] h3[data-state="open"]')
    if opened_element.all() and opened_element.get_by_role("button").is_visible():
        opened_element.get_by_role("button").click()


def validate_info_section(page: Page, fields: [[str, str]]):
    for rowNumber, field in enumerate(fields):
        name, value = field
        expect(
            page.get_by_test_id(
                "key-value-table-row").nth(rowNumber).locator("dt")
        ).to_contain_text(name)
        expect(
            page.get_by_test_id(
                "key-value-table-row").nth(rowNumber).locator("dd")
        ).to_contain_text(value)


def test_market_spot_info_current_fees(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Current fees").click()
    fields = [
        ["Maker fee", "10%"],
        ["Infrastructure fee", "0.05%"],
        ["Liquidity fee", "0%"],
        ["Total fees", "10.05%"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_market_price(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Market price").click()
    fields = [
        ["Mark price", "108.5"],
        ["Best bid price", "106.0"],
        ["Best offer price", "107.0"],
        ["Quote unit", "USDT"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_market_volume(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Market volume").click()
    fields = [
        ["24 hour volume", "10.00(1,085 USDT)"],
        ["Open interest", "-"],
        ["Best bid volume", "649.00"],
        ["Best offer volume", "109.00"],
        ["Best static bid volume", "550.00"],
        ["Best static offer volume", "1"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_key_details(page: Page, vega: VegaServiceNull):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Key details").click()
    market_id = vega.find_market_id("Bitcoin / Tether USD (Spot)")
    short_market_id = market_id[:6] + "…" + market_id[-4:]
    fields = [
        ["Market ID", short_market_id],
        ["Name", "Bitcoin / Tether USD (Spot)"],
        ["Status", "Active"],
        ["Trading mode", "Continuous"],
        ["Price decimal places", "1"],
        ["Size decimal places", "2"],
        ["Quote asset decimal places", "5"],
        ["Base asset decimal places", "5"],
        ["Tick size", "1"]
    ]
    validate_info_section(page, fields)


def test_market_spot_info_instrument(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text("Instrument").click()
    fields = [
        ["Market name", "Bitcoin / Tether USD (Spot)"],
        ["Code", "BTC/USDT-SPOT"],
        ["Product type", "Spot"],
        ["Quote name", "USDT"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_base_asset(page: Page, vega: VegaServiceNull):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Base asset").click()
    tdai_id = vega.find_asset_id("BTC")
    tdai_id_short = tdai_id[:6] + "…" + tdai_id[-4:]
    fields = [
        ["ID", tdai_id_short],
        ["Type", "Builtin asset"],
        ["Name", "BTC"],
        ["Symbol", "BTC"],
        ["Decimals", "5"],
        ["Quantum", "0.00001"],
        ["Status", "Enabled"],
        ["Max faucet amount", "10,000,000,000.00"],
        ["Global insurance account balance", "0.00"],
        ["Network treasury account balance", "0.00"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_quote_data(page: Page, vega: VegaServiceNull):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Quote asset").click()
    tdai_id = vega.find_asset_id("USDT")
    tdai_id_short = tdai_id[:6] + "…" + tdai_id[-4:]
    fields = [
        ["ID", tdai_id_short],
        ["Type", "Builtin asset"],
        ["Name", "USDT"],
        ["Symbol", "USDT"],
        ["Decimals", "5"],
        ["Quantum", "0.00001"],
        ["Status", "Enabled"],
        ["Max faucet amount", "10,000,000,000.00"],
        ["Global insurance account balance", "0.00"],
        ["Network treasury account balance", "0.00"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_metadata(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text("Metadata").click()


def test_market_spot_info_price_monitoring_bounds(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Price monitoring bounds"
    ).click()
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("bounds-percent-price").nth(1)
           ).to_contain_text("90.001")
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("bounds-price-time").nth(0)
           ).to_contain_text("within 15m")
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("text-left-alignment").nth(0)
           ).to_contain_text("105.7")
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("text-right-alignment").nth(0)
           ).to_contain_text("111.3")


def test_market_spot_info_liquidity_monitoring_parameters(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity monitoring parameters"
    ).click()
    fields = [
        ["Time window", "3,600"],
        ["Scaling factor", "1"],
    ]
    validate_info_section(page, fields)


# Liquidity resolves to 3 results
def test_market_spot_info_liquidity(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity", exact=True
    ).click()
    fields = [
        ["Target stake", "10,000.00 USDT"],
        ["Supplied stake", "10,000.00 USDT"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_liquidity_price_range(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity price range"
    ).click()
    fields = [
        ["Liquidity price range", "50% of mid price "],
        ["Lowest price", "53.3"],
        ["Highest price", "159.8"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_proposal(page: Page, vega: VegaServiceNull):
    page.get_by_test_id(market_title_test_id).get_by_text("Proposal").click()
    first_link = (
        page.get_by_test_id(
            "accordion-content").get_by_test_id("external-link").first
    )
    second_link = (
        page.get_by_test_id(
            "accordion-content").get_by_test_id("external-link").nth(1)
    )
    expect(first_link).to_have_text("View governance proposal")
    expect(first_link).to_have_attribute(
        "href", re.compile(
            rf'(\/proposals\/{vega.find_market_id("Bitcoin / Tether USD (Spot)")})')
    )
    expect(second_link).to_have_text("Propose a change to market")

    # create regular expression that matches "/proposals/propose/update-market" string
    expect(second_link).to_have_attribute(
        "href", re.compile(r"(\/proposals\/propose\/update-market)")
    )


def test_market_spot_ticket(page: Page):
    page.get_by_test_id("Trade").click()
    expect(page.get_by_test_id("order-side-SIDE_BUY")).to_have_text("Buy")
    expect(page.get_by_test_id("order-side-SIDE_SELL")).to_have_text("Sell")
    expect(page.get_by_test_id("reduce-only")).not_to_be_attached()
    expect(page.get_by_test_id("deal-ticket-fee-current-margin")
           ).not_to_be_attached()
    expect(page.get_by_test_id("deal-ticket-fee-liquidation-estimate")
           ).not_to_be_attached()
