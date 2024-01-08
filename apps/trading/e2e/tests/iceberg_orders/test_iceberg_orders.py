import pytest
from playwright.sync_api import expect, Page
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from conftest import init_vega
from fixtures.market import setup_continuous_market
from wallet_config import MM_WALLET2

def hover_and_assert_tooltip(page: Page, element_text):
    element = page.get_by_text(element_text)
    element.hover()
    expect(page.get_by_role("tooltip")).to_be_visible()

class TestIcebergOrdersValidations:
    @pytest.fixture(scope="class")
    def vega(self, request):
        with init_vega(request) as vega:
            yield vega

    @pytest.fixture(scope="class")
    def continuous_market(self, vega):
        return setup_continuous_market(vega)

    @pytest.mark.usefixtures("auth", "risk_accepted")
    def test_iceberg_submit(self, continuous_market, vega: VegaServiceNull, page: Page):
        page.goto(f"/#/markets/{continuous_market}")
        page.get_by_test_id("iceberg").click()
        page.get_by_test_id("order-peak-size").type("2")
        page.get_by_test_id("order-minimum-size").type("1")
        page.get_by_test_id("order-size").type("3")
        page.get_by_test_id("order-price").type("107")
        page.get_by_test_id("place-order").click()

        expect(page.get_by_test_id("toast-content")).to_have_text(
            "Awaiting confirmationPlease wait for your transaction to be confirmedView in block explorer"
        )

        vega.forward("10s")
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        expect(page.get_by_test_id("toast-content")).to_have_text(
            "Order filledYour transaction has been confirmedView in block explorerSubmit order - filledBTC:DAI_2023+3 @ 107.00 tDAI"
        )
        page.get_by_test_id("All").click()
        expect(
            (page.get_by_role("row").locator('[col-id="type"]')).nth(1)
        ).to_have_text("Limit (Iceberg)")

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_iceberg_open_order(continuous_market, vega: VegaServiceNull, page: Page):
    page.goto(f"/#/markets/{continuous_market}")

    submit_order(vega, "Key 1", continuous_market, "SIDE_SELL", 102, 101, 2, 1)
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.wait_for_selector(".ag-center-cols-container .ag-row")
    expect(
        page.locator(
            ".ag-center-cols-container .ag-row [col-id='openVolume'] [data-testid='stack-cell-primary']"
        )
    ).to_have_text("-98")
    page.get_by_test_id("Open").click()
    page.wait_for_selector(".ag-center-cols-container .ag-row")

    expect(
        page.locator(".ag-center-cols-container .ag-row [col-id='remaining']").first
    ).to_have_text("99")
    expect(
        page.locator(".ag-center-cols-container .ag-row [col-id='size']").first
    ).to_have_text("-102")
    expect(
        page.locator(".ag-center-cols-container .ag-row [col-id='type'] ").first
    ).to_have_text("Limit (Iceberg)")
    expect(
        page.locator(".ag-center-cols-container .ag-row [col-id='status']").first
    ).to_have_text("Active")
    expect(page.get_by_test_id("price-10100000")).to_be_visible
    expect(page.get_by_test_id("ask-vol-10100000")).to_have_text("3")
    page.get_by_test_id("Trades").click()
    expect(page.locator('[id^="cell-price-"]').first).to_have_text("101.50")
    expect(page.locator('[id^="cell-size-"]').first).to_have_text("99")

    submit_order(vega, MM_WALLET2.name, continuous_market, "SIDE_BUY", 103, 101)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(
        page.locator(
            '[data-testid="tab-open-orders"] .ag-center-cols-container .ag-row'
        )
    ).not_to_be_visible
    page.get_by_test_id("Closed").click()
    expect(
        page.locator(".ag-center-cols-container .ag-row [col-id='remaining']").first
    ).to_have_text("102")
    expect(
        page.locator(
            "[data-testid=\"tab-closed-orders\"] .ag-center-cols-container .ag-row [col-id='size']"
        ).first
    ).to_have_text("-102")
    expect(
        page.locator(
            "[data-testid=\"tab-closed-orders\"] .ag-center-cols-container .ag-row [col-id='type']"
        ).first
    ).to_have_text("Limit (Iceberg)")
    expect(
        page.locator(
            "[data-testid=\"tab-closed-orders\"] .ag-center-cols-container .ag-row [col-id='status']"
        ).first
    ).to_have_text("Filled")
    expect(page.locator('[id^="cell-price-"]').nth(2)).to_have_text("101.00")
    expect(page.locator('[id^="cell-size-"]').nth(2)).to_have_text("3")


def verify_order_label(page: Page, test_id: str, expected_text: str):
    element = page.get_by_test_id(test_id)
    expect(element).to_be_visible()
    expect(element).to_have_text(expected_text)


def verify_order_value(page: Page, test_id: str, expected_text: str):
    element = page.get_by_test_id(test_id)
    expect(element).to_be_visible()
    expect(element).to_have_text(expected_text)
