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
    opened_element = page.locator('h3[data-state="open"]')
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
        ["Maker Fee", "10%"],
        ["Infrastructure Fee", "0.05%"],
        ["Liquidity Fee", "0%"],
        ["Total Fees", "10.05%"],
    ]
    validate_info_section(page, fields)

def test_market_spot_info_market_price(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Market price").click()
    fields = [
        ["Mark Price", "107.5"],
        ["Best Bid Price", "101.5"],
        ["Best Offer Price", "103.5"],
        ["Quote Unit", "USDT"],
    ]
    validate_info_section(page, fields)

def test_market_spot_info_market_volume(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text("Market volume").click()
    fields = [
        ["24 Hour Volume", "1.00(108 USDT)"],
        ["Open Interest", "-"],
        ["Best Bid Volume", "99"],
        ["Best Offer Volume", "99"],
        ["Best Static Bid Volume", "1"],
        ["Best Static Offer Volume", "1"],
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
        ["Trading Mode", "Continuous"],
        ["Price Decimal Places", "1"],
        ["Size Decimal Places", "2"],
        ["Quote Asset Decimal Places", "5"],
        ["Base Asset Decimal Places", "5"],
        ["Tick Size", "1"]
    ]
    validate_info_section(page, fields)

def test_market_spot_info_instrument(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text("Instrument").click()
    fields = [
        ["Market Name", "Bitcoin / Tether USD (Spot)"],
        ["Code", "BTC/USDT-SPOT"],
        ["Product Type", "Spot"],
        ["Quote Name", "USDT"],
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
        ["Infrastructure fee account balance", "0.003"],
        ["Global reward pool account balance", "0.00"],
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
        ["Infrastructure fee account balance", "0.003"],
        ["Global reward pool account balance", "0.00"],
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
           ).to_contain_text("104.7")
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("text-right-alignment").nth(0)
           ).to_contain_text("110.3")


def test_market_spot_info_liquidity_monitoring_parameters(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity monitoring parameters"
    ).click()
    fields = [
        ["Time Window", "3,600"],
        ["Scaling Factor", "1"],
    ]
    validate_info_section(page, fields)


# Liquidity resolves to 3 results
def test_market_spot_info_liquidity(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity", exact=True
    ).click()
    fields = [
        ["Target Stake", "100.00 USDT"],
        ["Supplied Stake", "10,000.00 USDT"],
    ]
    validate_info_section(page, fields)


def test_market_spot_info_liquidity_price_range(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity price range"
    ).click()
    fields = [
        ["Liquidity Price Range", "50% of mid price "],
        ["Lowest Price", "51.3"],
        ["Highest Price", "153.8"],
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
    page.get_by_test_id("Order").click()
    expect(page.get_by_test_id("order-side-SIDE_BUY")).to_have_text("Buy")
    expect(page.get_by_test_id("order-side-SIDE_SELL")).to_have_text("Sell")
    expect(page.get_by_test_id("reduce-only")).not_to_be_attached()
    expect(page.get_by_test_id("deal-ticket-fee-current-margin")).not_to_be_attached()
    expect(page.get_by_test_id("deal-ticket-fee-liquidation-estimate")).not_to_be_attached()
