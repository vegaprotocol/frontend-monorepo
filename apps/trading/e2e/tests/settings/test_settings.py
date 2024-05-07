import pytest
from playwright.sync_api import expect, Page
from conftest import init_vega, cleanup_container
from wallet_config import PARTY_A, PARTY_B, PARTY_C, PARTY_D, MM_WALLET, wallets


mint_amount: float = 10e5

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance


@pytest.mark.usefixtures("risk_accepted")
def test_share_usage_data(page: Page, vega):
    page.goto("/")
    for wallet in wallets:
        vega.create_key(wallet.name)

    vega.mint(
        MM_WALLET.name,
        asset=vega.find_asset_id(symbol="VOTE", enabled=True),
        amount=mint_amount,
    )
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    vega.update_network_parameter(
        MM_WALLET.name, parameter="blockchains.ethereumConfig", new_value= "{\"network_id\":\"11155111\",\"chain_id\":\"11155111\",\"collateral_bridge_contract\":{\"address\":\"0x23872549cE10B40e31D6577e0A920088B0E0666a\"},\"confirmations\":64,\"staking_bridge_contract\":{\"address\":\"0x195064D33f09e0c42cF98E665D9506e0dC17de68\",\"deployment_block_height\":13146644},\"token_vesting_contract\":{\"address\":\"0x23d1bFE8fA50a167816fBD79D7932577c06011f4\",\"deployment_block_height\":12834524},\"multisig_control_contract\":{\"address\":\"0xDD2df0E7583ff2acfed5e49Df4a424129cA9B58F\",\"deployment_block_height\":15263593}}"
    )  
    page.pause()
    vega.wait_fn(20)
    vega.wait_for_total_catchup()
    page.pause()
    page.get_by_test_id("Settings").click()
    telemetry_switch = page.locator("#switch-settings-telemetry-switch")
    expect(telemetry_switch).to_have_attribute("data-state", "unchecked")

    telemetry_switch.click()
    expect(telemetry_switch).to_have_attribute("data-state", "checked")
    page.reload()
    page.get_by_test_id("Settings").click()
    expect(telemetry_switch).to_have_attribute("data-state", "unchecked")

    telemetry_switch.click()
    expect(telemetry_switch).to_have_attribute("data-state", "checked")
    page.reload()
    page.get_by_test_id("Settings").click()
    expect(telemetry_switch).to_have_attribute("data-state", "unchecked")


# Define a mapping of icon selectors to toast selectors
ICON_TO_TOAST = {
    'aria-label="arrow-top-left icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-up icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-top-right icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-bottom-left icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-down icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-bottom-right icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
}


@pytest.mark.usefixtures("risk_accepted")
def test_toast_positions(page: Page):
    page.goto("/")
    page.get_by_test_id("Settings").click()
    for icon_selector, toast_selector in ICON_TO_TOAST.items():
        # Click the icon
        page.click(f"[{icon_selector}]")
        # Expect that the toast is displayed
        expect(page.locator(f"[{toast_selector}]")).to_be_visible()


@pytest.mark.usefixtures("risk_accepted")
def test_dark_mode(page: Page):
    page.goto("/")
    page.get_by_test_id("Settings").click()
    expect(page.locator("html")).not_to_have_attribute("class", "dark")
    page.locator("#switch-settings-theme-switch").click()
    expect(page.locator("html")).to_have_attribute("class", "dark")
