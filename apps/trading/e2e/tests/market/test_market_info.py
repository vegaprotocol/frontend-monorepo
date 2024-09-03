import re
import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from fixtures.market import setup_continuous_market
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
        market_id = setup_continuous_market(vega)
        risk_accepted_setup(page)
        page.goto(f"/#/markets/{market_id}")
        page.get_by_test_id("Info").click()
        yield page


@pytest.fixture(autouse=True)
def after_each(page: Page):
    yield
    opened_element = page.locator('h3[data-state="open"]')
    if opened_element.all() and opened_element.get_by_role("button").nth(1).is_visible():
        opened_element.get_by_role("button").nth(1).click()


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


def test_market_info_current_fees(page: Page):
    # 6002-MDET-101
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Current fees").click()
    fields = [
        ["Maker fee", "10%"],
        ["Infrastructure fee", "0.05%"],
        ["Liquidity fee", "0%"],
        ["Total fees", "10.05%"],
    ]
    validate_info_section(page, fields)


def test_market_info_market_price(page: Page):
    # 6002-MDET-102
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Market price").click()
    fields = [
        ["Mark price", "107.50"],
        ["Best bid price", "101.50"],
        ["Best offer price", "103.50"],
        ["Quote unit", "BTC"],
    ]
    validate_info_section(page, fields)


def test_market_info_market_volume(page: Page):
    # 6002-MDET-103
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Market volume").click()
    fields = [
        ["24 hour volume", "1(107 BTC)"],
        ["Open interest", "1"],
        ["Best bid volume", "99"],
        ["Best offer volume", "99"],
        ["Best static bid volume", "1"],
        ["Best static offer volume", "1"],
    ]
    validate_info_section(page, fields)


def test_market_info_liquidation_strategy(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidation strategy"
    ).click()
    fields = [
        ["Disposal fraction", "1"],
        ["Disposal time step", "1"],
        ["Full disposal size", "1,000,000,000"],
        ["Max fraction consumed", "0.5"],
    ]
    validate_info_section(page, fields)


def test_market_info_liquidation(page: Page):
    # 6002-MDET-104
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidations").click()
    fields = [["Insurance pool balance", "0.00 tDAI"]]
    validate_info_section(page, fields)


def test_market_info_key_details(page: Page, vega: VegaServiceNull):
    # 6002-MDET-201
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Key details").click()
    market_id = vega.find_market_id("BTC:DAI_2023")
    short_market_id = market_id[:6] + "…" + market_id[-4:]
    fields = [
        ["Market ID", short_market_id],
        ["Name", "BTC:DAI_2023"],
        ["Status", "Active"],
        ["Trading mode", "Continuous"],
        ["Market decimal places", "5"],
        ["Position decimal places", "0"],
        ["Settlement asset decimal places", "5"],
    ]
    validate_info_section(page, fields)


def test_market_info_instrument(page: Page):
    # 6002-MDET-202
    page.get_by_test_id(market_title_test_id).get_by_text("Instrument").click()
    fields = [
        ["Market name", "BTC:DAI_2023"],
        ["Code", "BTC:DAI_2023"],
        ["Product type", "Future"],
        ["Quote name", "BTC"],
    ]
    validate_info_section(page, fields)


def test_market_info_mark_price(page: Page):
    page.get_by_test_id(market_title_test_id).get_by_text("Mark Price").click()
    fields = [
        ["Composite price type", "Last trade"],
        ["Staleness tolerance", "-"],
        ["Decay weight", "0"],
        ["Decay power", "0"],
        ["Staleness tolerance", "-"],
        ["Cash amount", "0.00 tDAI"],
        ["Staleness tolerance", "-"],
    ]
    validate_info_section(page, fields)


def test_market_info_settlement_asset(page: Page, vega: VegaServiceNull):
    # 6002-MDET-206
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Settlement asset").click()
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
        ["Global insurance account balance", "0.00"],
        ["Network treasury account balance", "0.00"],
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
        ["Risk aversion parameter", "0.000001"],
        ["Sigma", "1"],
    ]
    validate_info_section(page, fields)


def test_market_info_margin_scaling_factors(page: Page):
    # 6002-MDET-209
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Margin scaling factors"
    ).click()
    fields = [
        ["Linear slippage factor", "0.001"],
        ["Search level", "1.1"],
        ["Initial margin", "1.5"],
        ["Collateral release", "1.7"],
    ]
    validate_info_section(page, fields)


def test_market_info_risk_factors(page: Page):
    # 6002-MDET-210
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Risk factors").click()
    fields = [
        ["Long", "0.05153"],
        ["Short", "0.05421"],
        ["Max leverage long", "19.405"],
        ["Max leverage short", "18.445"],
        ["Max initial leverage long", "12.937"],
        ["Max initial leverage short", "12.296"],
    ]
    validate_info_section(page, fields)


def test_market_info_price_monitoring_bounds(page: Page):
    # 6002-MDET-211
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Price monitoring bounds"
    ).click()
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("bounds-percent-price")
            ).to_contain_text("99.9999%")
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("bounds-price-time")
            ).to_contain_text("within 1d")
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("text-left-alignment")
            ).to_contain_text("83.11038 BTC")
    expect(page.get_by_test_id(market_accordion_content).get_by_test_id("text-right-alignment")
            ).to_contain_text("138.66685 BTC")


def test_market_info_liquidity_monitoring_parameters(page: Page):
    # 6002-MDET-212
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity monitoring parameters"
    ).click()
    fields = [
        ["Time window", "3,600"],
        ["Scaling factor", "1"],
    ]
    validate_info_section(page, fields)


# Liquidity resolves to 3 results
def test_market_info_liquidity(page: Page):
    # 6002-MDET-213
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity", exact=True
    ).click()
    fields = [
        ["Target stake", "5.82757 tDAI"],
        ["Supplied stake", "10,000.00 tDAI"],
    ]
    validate_info_section(page, fields)


def test_market_info_liquidity_price_range(page: Page):
    # 6002-MDET-214
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Liquidity price range"
    ).click()
    fields = [
        ["Liquidity price range", "100% of mid price"],
        ["Lowest price", "0.00 BTC"],
        ["Highest price", "205.00 BTC"],
    ]
    validate_info_section(page, fields)


def test_market_info_proposal(page: Page, vega: VegaServiceNull):
    # 6002-MDET-301
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
            rf'(\/proposals\/{vega.find_market_id("BTC:DAI_2023")})')
    )
    expect(second_link).to_have_text("Propose a change to market")

    # create regular expression that matches "/proposals/propose/update-market" string
    expect(second_link).to_have_attribute(
        "href", re.compile(r"(\/proposals\/propose\/update-market)")
    )


def test_market_info_succession_line(page: Page, vega: VegaServiceNull):
    page.get_by_test_id(market_title_test_id).get_by_text(
        "Succession line").click()
    market_id = vega.find_market_id("BTC:DAI_2023")
    succession_line = page.get_by_test_id("succession-line-item")
    expect(succession_line.get_by_test_id(
        "external-link")).to_have_text("BTC:DAI_2023")
    expect(succession_line.get_by_test_id("external-link")).to_have_attribute(
        "href", re.compile(rf"(\/proposals\/{market_id})")
    )
    expect(page.get_by_test_id("succession-line-item-market-id")).to_have_text(
        market_id
    )
