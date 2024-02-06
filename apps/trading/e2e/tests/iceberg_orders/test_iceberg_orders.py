import pytest
from playwright.sync_api import expect, Page
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from fixtures.market import setup_continuous_market
from wallet_config import WalletConfig, MM_WALLET2
from actions.utils import (
    change_keys,
    create_and_faucet_wallet,
)

def hover_and_assert_tooltip(page: Page, element_text):
    element = page.get_by_text(element_text)
    element.hover()
    expect(page.get_by_role("tooltip")).to_be_visible()

@pytest.fixture(scope="session")
def iceberg_key(shared_vega):
    iceberg_key = WalletConfig("iceberg_key", "iceberg_key")
    create_and_faucet_wallet(vega=shared_vega, wallet=iceberg_key)
    return iceberg_key

@pytest.fixture(scope="session")
def continuous_market(shared_vega:VegaServiceNull):
    keypairs = shared_vega.wallet.get_keypairs("MarketSim")
    proposal_key = keypairs.get('market_maker')
    termination_key=keypairs.get('FJMKnwfZdd48C8NqvYrG')
    mm_2_key=keypairs.get('market_maker_2')

    kwargs = {}
    if proposal_key is not None:
        kwargs['proposal_key'] = proposal_key
    if termination_key is not None:
        kwargs['termination_key'] = termination_key
    if mm_2_key is not None:
        kwargs['mm_2_key'] = mm_2_key


    return setup_continuous_market(shared_vega, **kwargs)

@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_iceberg_submit(continuous_market, vega: VegaServiceNull, page: Page, iceberg_key):
        page.goto(f"/#/markets/{continuous_market}")
        change_keys(page, vega, iceberg_key.name)
        page.get_by_test_id("iceberg").click()
        page.get_by_test_id("order-peak-size").type("2")
        page.get_by_test_id("order-minimum-size").type("1")
        page.get_by_test_id("order-size").type("3")
        page.get_by_test_id("order-price").type("107")
        page.get_by_test_id("place-order").click()

        expect(page.get_by_test_id("toast-content")).to_have_text(
            "Awaiting confirmationPlease wait for your transaction to be confirmedView in block explorer"
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        expect(page.get_by_test_id("toast-content")).to_contain_text(
            "Your transaction has been confirmedView in block explorerSubmit order - filledBTC:DAI_2023+3 @ 107.00 tDAI"
        )
        page.get_by_test_id("All").click()
        expect(
            (page.get_by_role("row").locator('[col-id="type"]')).nth(1)
        ).to_have_text("Limit (Iceberg)")

@pytest.mark.shared_vega
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_iceberg_open_order(continuous_market, vega: VegaServiceNull, page: Page, iceberg_key):
    page.goto(f"/#/markets/{continuous_market}")
    change_keys(page, vega, iceberg_key.name)
    submit_order(vega, iceberg_key.name, continuous_market, "SIDE_SELL", 102, 101, 2, 1)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
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
    page.reload()
    expect(page.locator('[id^="cell-price-"]').first).to_have_text("101.00")
    expect(page.locator('[id^="cell-size-"]').first).to_have_text("3")
    



def verify_order_label(page: Page, test_id: str, expected_text: str):
    element = page.get_by_test_id(test_id)
    expect(element).to_be_visible()
    expect(element).to_have_text(expected_text)


def verify_order_value(page: Page, test_id: str, expected_text: str):
    element = page.get_by_test_id(test_id)
    expect(element).to_be_visible()
    expect(element).to_have_text(expected_text)
