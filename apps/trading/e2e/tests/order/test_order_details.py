import pytest
import re
from playwright.sync_api import expect, Page
from vega_sim.service import VegaService
from actions.vega import submit_order

order_details = [
    ("order-market-label", "Market", "order-market-value", "BTC:DAI_2023"),
    ("order-side-label", "Side", "order-side-value", "Short"),
    ("order-type-label", "Type", "order-type-value", "Limit"),
    ("order-price-label", "Price", "order-price-value", "101.00"),
    ("order-size-label", "Size", "order-size-value", "-102"),
    ("order-remaining-label", "Remaining", "order-remaining-value", "-2"),
    ("order-status-label", "Status", "order-status-value", "Active"),
    ("order-id-label", "Order ID", "order-id-value", r"^.{10}\u2026.+Copy$", True),
    (
        "order-created-label",
        "Created",
        "order-created-value",
        r"^\d{1,2}/\d{1,2}/\d{4}, \d{1,2}:\d{2}:\d{2}$",
        True,
    ),
    (
        "order-time-in-force-label",
        "Time in force",
        "order-time-in-force-value",
        "Good 'til Cancelled (GTC)",
    ),
]


def verify_order_label(page: Page, test_id: str, expected_text: str):
    element = page.get_by_test_id(test_id)
    expect(element).to_be_visible()
    expect(element).to_have_text(expected_text)


def verify_order_value(
    page: Page, test_id: str, expected_text: str, is_regex: bool = False
):
    element = page.get_by_test_id(test_id)
    expect(element).to_be_visible()
    if is_regex:
        actual_text = element.text_content()

        if actual_text is None:
          raise Exception(f"no text found for test_id {test_id}")

        assert re.match(
            expected_text, actual_text
        ), f"Expected {expected_text}, but got {actual_text}"
    else:
        expect(element).to_have_text(expected_text)


@pytest.mark.skip("tbd")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_order_details_are_correctly_displayed(
    continuous_market, vega: VegaService, page: Page
):
    page.goto(f"/#/markets/{continuous_market}")
    submit_order(vega, "Key 1", vega.all_markets()[0].id, "SIDE_SELL", 102, 101, 2, 1)
    page.get_by_test_id("Open").click()
    page.get_by_test_id("icon-kebab").click()
    page.get_by_test_id("view-order").click()
    for detail in order_details:
        label_id, label_text, value_id, value_text, is_regex = (*detail, False)[:5]
        verify_order_label(page, label_id, label_text)
        verify_order_value(page, value_id, value_text, is_regex)
