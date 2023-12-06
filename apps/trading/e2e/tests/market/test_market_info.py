import re
import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from fixtures.market import setup_continuous_market

from conftest import init_page, init_vega, risk_accepted_setup

market_title_test_id = "accordion-title"


@pytest.fixture(scope="module")
def vega():
    with init_vega() as vega:
        yield vega


# setting up everything in this single fixture, as all of the tests need the same setup, so no point in creating separate ones
@pytest.fixture(scope="module")
def page(vega, browser, request):
    with init_page(vega, browser, request) as page:
        setup_continuous_market(vega)
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
            page.get_by_test_id("key-value-table-row").nth(rowNumber).locator("dt")
        ).to_contain_text(name)
        expect(
            page.get_by_test_id("key-value-table-row").nth(rowNumber).locator("dd")
        ).to_contain_text(value)


def test_market_info_current_fees(page: Page):
    # 6002-MDET-101
    page.get_by_test_id(market_title_test_id).get_by_text("Current fees").click()
    fields = [
        ["Maker Fee", "10%"],
        ["Infrastructure Fee", "0.05%"],
        ["Liquidity Fee", "0%"],
        ["Total Fees", "10.05%"],
    ]
    validate_info_section(page, fields)


def test_market_info_market_price(page: Page):
    # 6002-MDET-102
    page.get_by_test_id(market_title_test_id).get_by_text("Market price").click()
    fields = [
        ["Mark Price", "107.50"],
        ["Best Bid Price", "101.50"],
        ["Best Offer Price", "103.50"],
        ["Quote Unit", "BTC"],
    ]
    validate_info_section(page, fields)


def test_market_info_market_volume(page: Page):
    # 6002-MDET-103
    page.get_by_test_id(market_title_test_id).get_by_text("Market volume").click()
    fields = [
        ["24 Hour Volume", "-"],
        ["Open Interest", "1"],
        ["Best Bid Volume", "99"],
        ["Best Offer Volume", "99"],
        ["Best Static Bid Volume", "1"],
        ["Best Static Offer Volume", "1"],
    ]
    validate_info_section(page, fields)


def test_market_info_insurance_pool(page: Page):
    # 6002-MDET-104
    page.get_by_test_id(market_title_test_id).get_by_text("Insurance pool").click()
    fields = [["Balance", "0.00 tDAI"]]
    validate_info_section(page, fields)


def test_market_info_key_details(page: Page, vega: VegaService):
    # 6002-MDET-201
    page.get_by_test_id(market_title_test_id).get_by_text("Key details").click()
    market_id = vega.find_market_id("BTC:DAI_2023")
    short_market_id = market_id[:6] + "…" + market_id[-4:]
    fields = [
        ["Market ID", short_market_id],
        ["Name", "BTC:DAI_2023"],
        ["Parent Market ID", "-"],
        ["Insurance Pool Fraction", "-"],
        ["Status", "Active"],
        ["Trading Mode", "Continuous"],
        ["Market Decimal Places", "5"],
        ["Position Decimal Places", "0"],
        ["Settlement Asset Decimal Places", "5"],
    ]
    validate_info_section(page, fields)


def test_market_info_instrument(page: Page):
    # 6002-MDET-202
    page.get_by_test_id(market_title_test_id).get_by_text("Instrument").click()
    fields = [
        ["Market Name", "BTC:DAI_2023"],
        ["Code", "BTC:DAI_2023"],
        ["Product Type", "Future"],
        ["Quote Name", "BTC"],
    ]
    validate_info_section(page, fields)


# @pytest.mark.skip("oracle test to be fixed")
def test_market_info_oracle(page: Page, vega: VegaService):
    # 6002-MDET-203
    page.get_by_test_id(market_title_test_id).get_by_text("Oracle").click()
    expect(
        page.locator('[data-state="open"]').get_by_test_id("accordion-content")
    ).to_contain_text("No oracle proof for settlement data")
    expect(page.get_by_test_id("oracle-spec-links")).to_have_text(
        "View settlement data specification"
    )
    # expect(page.get_by_test_id("oracle-spec-links")).to_have_attribute(
    #     "href", re.compile(rf'(\/oracles\/{vega.find_market_id("BTC:DAI_2023")})')
    # )


def test_market_info_settlement_asset(page: Page, vega: VegaService):
    # 6002-MDET-206
    page.get_by_test_id(market_title_test_id).get_by_text("Settlement asset").click()
    tdai_id = vega.find_asset_id("tDAI")
    tdai_id_short = tdai_id[:6] + "…" + tdai_id[-4:]
    fields = [
        ["ID", tdai_id_short],
        ["Type", "Builtin asset"],
        ["Name", "tDAI"],
        ["Symbol", "tDAI"],
        ["Decimals", "5"],
        ["Quantum", "0.00001"],
        ["Status", "Enabled"],
        ["Max faucet amount", "10,000,000,000.00"],
        ["Infrastructure fee account balance", "0.00"],
        ["Global reward pool account balance", "0.00"],
    ]
    validate_info_section(page, fields)


def test_market_info_metadata(page: Page):
    # 6002-MDET-207
    page.get_by_test_id(market_title_test_id).get_by_text("Metadata").click()
    fields = [
        ["Base", "BTC"],
    ]
    validate_info_section(page, fields)


def test_market_info_risk_model(page: Page):
    # 6002-MDET-208
    page.get_by_test_id(market_title_test_id).get_by_text("Risk model").click()
    fields = [
        ["Tau", "0.00011407711613050422"],
        ["Risk Aversion Parameter", "0.000001"],
        ["Sigma", "1"],
    ]
    validate_info_section(page, fields)


def test_market_info_margin_scaling_factors(page: Page):
    # 6002-MDET-209
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Margin scaling factors"
    ).click()
    fields = [
        ["Linear Slippage Factor", "0.001"],
        ["Quadratic Slippage Factor", "0"],
        ["Search Level", "1.1"],
        ["Initial Margin", "1.5"],
        ["Collateral Release", "1.7"],
    ]
    validate_info_section(page, fields)


def test_market_info_risk_factors(page: Page):
    # 6002-MDET-210
    page.get_by_test_id(market_title_test_id).get_by_text("Risk factors").click()
    fields = [
        ["Long", "0.05153"],
        ["Short", "0.05422"],
        ["Max Leverage Long", "19.406"],
        ["Max Leverage Short", "18.445"],
        ["Max Initial Leverage Long", "12.937"],
        ["Max Initial Leverage Short", "12.297"],
    ]
    validate_info_section(page, fields)


def test_market_info_price_monitoring_bounds(page: Page):
    # 6002-MDET-211
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Price monitoring bounds 1"
    ).click()
    expect(page.locator("p.col-span-1").nth(0)).to_contain_text(
        "99.9999% probability price bounds"
    )
    expect(page.locator("p.col-span-1").nth(1)).to_contain_text("Within 86,400 seconds")
    fields = [
        ["Highest Price", "138.66685 BTC"],
        ["Lowest Price", "83.11038 BTC"],
    ]
    validate_info_section(page, fields)


def test_market_info_liquidity_monitoring_parameters(page: Page):
    # 6002-MDET-212
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity monitoring parameters"
    ).click()
    fields = [
        ["Triggering Ratio", "0.7"],
        ["Time Window", "3,600"],
        ["Scaling Factor", "1"],
    ]
    validate_info_section(page, fields)


# Liquidity resolves to 3 results
def test_market_info_liquidit(page: Page):
    # 6002-MDET-213
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity", exact=True
    ).click()
    fields = [
        ["Target Stake", "5.82757 tDAI"],
        ["Supplied Stake", "10,000.00 tDAI"],
    ]
    validate_info_section(page, fields)


def test_market_info_liquidity_price_range(page: Page):
    # 6002-MDET-214
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity price range"
    ).click()
    fields = [
        ["Liquidity Price Range", "100% of mid price"],
        ["Lowest Price", "0.00 BTC"],
        ["Highest Price", "205.00 BTC"],
    ]
    validate_info_section(page, fields)


def test_market_info_proposal(page: Page, vega: VegaService):
    # 6002-MDET-301
    page.get_by_test_id(market_title_test_id).get_by_text("Proposal").click()
    first_link = (
        page.get_by_test_id("accordion-content").get_by_test_id("external-link").first
    )
    second_link = (
        page.get_by_test_id("accordion-content").get_by_test_id("external-link").nth(1)
    )
    expect(first_link).to_have_text("View governance proposal")
    expect(first_link).to_have_attribute(
        "href", re.compile(rf'(\/proposals\/{vega.find_market_id("BTC:DAI_2023")})')
    )
    expect(second_link).to_have_text("Propose a change to market")

    # create regular expression that matches "/proposals/propose/update-market" string
    expect(second_link).to_have_attribute(
        "href", re.compile(r"(\/proposals\/propose\/update-market)")
    )


def test_market_info_succession_line(page: Page, vega: VegaService):
    page.get_by_test_id(market_title_test_id).get_by_text("Succession line").click()
    market_id = vega.find_market_id("BTC:DAI_2023")
    succession_line = page.get_by_test_id("succession-line-item")
    expect(succession_line.get_by_test_id("external-link")).to_have_text("BTC:DAI_2023")
    expect(succession_line.get_by_test_id("external-link")).to_have_attribute(
        "href", re.compile(rf"(\/proposals\/{market_id})")
    )
    expect(page.get_by_test_id("succession-line-item-market-id")).to_have_text(
        market_id
    )
