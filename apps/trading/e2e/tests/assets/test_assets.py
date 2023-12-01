import pytest
import re
from playwright.sync_api import expect, Page

label_value_tooltip_pairs = [
    {
        "label": "ID",
        "value": "asset-id",
    },
    {
        "label": "Type",
        "value": "Builtin asset",
        "valueToolTip": "A Vega builtin asset",
    },
    {
        "label": "Name",
        "value": "tDAI",
    },
    {
        "label": "Symbol",
        "value": "tDAI",
    },
    {
        "label": "Decimals",
        "value": "5",
        "labelTooltip": "Number of decimal / precision handled by this asset",
    },
    {
        "label": "Quantum",
        "value": "0.00001",
        "labelTooltip": "The minimum economically meaningful amount of the asset",
    },
    {
        "label": "Status",
        "value": "Enabled",
        "labelTooltip": "The status of the asset in the Vega network",
        "valueToolTip": "Asset can be used on the Vega network",
    },
    {
        "label": "Max faucet amount",
        "value": "10,000,000,000.00",
        "labelTooltip": "Maximum amount that can be requested by a party through the built-in asset faucet at a time",
    },
    {
        "label": "Infrastructure fee account balance",
        "value": "0.00",
        "labelTooltip": "The infrastructure fee account in this asset",
    },
    {
        "label": "Global reward pool account balance",
        "value": "0.00",
        "labelTooltip": "The global rewards acquired in this asset",
    },
]


def tooltip(page: Page, index: int, test_id: str, tooltip: str):
    page.locator(f"data-testid={index}_{test_id}").hover()
    expect(page.locator('[role="tooltip"]').locator("div")).to_have_text(tooltip)
    page.get_by_test_id("dialog-title").click()


@pytest.mark.usefixtures("page", "continuous_market", "auth", "risk_accepted")
def test_asset_details(page: Page):
    page.goto("/#/portfolio")
    page.locator('[data-testid="tab-collateral"] >> text=tDAI').click()

    for index, pair in enumerate(label_value_tooltip_pairs):
        if index in [7, 8, 9]:  # Skip indices 7, 8, and 9.
            continue

        label = pair.get("label", "")
        value = pair.get("value", "")
        label_tooltip = pair.get("labelTooltip", "")
        value_tooltip = pair.get("valueToolTip", "")
    
        if label == "ID":
            expect(page.get_by_role("button", name="Copy id to clipboard")).to_be_visible()
            asset_id_text = page.locator(f"[data-testid='{index}_value']").inner_text()
            pattern = r"^[0-9a-f]{6}\u2026[0-9a-f]{4}"

            assert re.match(pattern, asset_id_text), f"Expected ID to match pattern but got {asset_id_text}"

        else:
            expect(page.locator(f"[data-testid='{index}_label']")).to_have_text(label)
            expect(page.locator(f"[data-testid='{index}_value']")).to_have_text(value)

        if label_tooltip:
            tooltip(page, index, "label", label_tooltip)

        if value_tooltip:
            tooltip(page, index, "value", value_tooltip)

    page.get_by_test_id("dialog-close").click()
    assert not page.query_selector("dialog-content")
