from collections import namedtuple
from playwright.sync_api import Page
from vega_sim.service import VegaService

from vega_sim.null_service import VegaServiceNull
from typing import Optional

WalletConfig = namedtuple("WalletConfig", ["name", "passphrase"])
ASSET_NAME = "tDAI"

def wait_for_toast_confirmation(page: Page, timeout: int = 30000):
    page.wait_for_function("""
    document.querySelector('[data-testid="toast-content"]') && 
    document.querySelector('[data-testid="toast-content"]').innerText.includes('AWAITING CONFIRMATION')
    """, timeout=timeout)

def create_and_faucet_wallet(
    vega: VegaServiceNull,
    wallet: WalletConfig,
    symbol: Optional[str] = None,
    amount: float = 1e4,
    
):
    asset_id = vega.find_asset_id(symbol=symbol if symbol is not None else ASSET_NAME)
    vega.create_key(wallet.name)
    vega.mint(wallet.name, asset_id, amount)

def next_epoch(vega: VegaServiceNull):
    forwards = 0
    epoch_seq = vega.statistics().epoch_seq
    while epoch_seq == vega.statistics().epoch_seq:
        vega.wait_fn(1)
        forwards += 1
        if forwards > 2 * 10 * 60:
            raise Exception(
                "Epoch not started after forwarding the duration of two epochs."
            )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

def truncate_middle(market_id, start=6, end=4):
    if len(market_id) < 11:
        return market_id
    return market_id[:start] + '\u2026' + market_id[-end:]

def change_keys(page: Page, vega:VegaServiceNull, key_name):
    page.get_by_test_id("manage-vega-wallet").click()
    page.get_by_test_id("key-" + vega.wallet.public_key(key_name)).click()
    page.click(f'data-testid=key-{vega.wallet.public_key(key_name)} >> .inline-flex')
    page.reload()

def forward_time(vega: VegaService, forward_epoch: bool = False):
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    if forward_epoch:
        next_epoch(vega)

def selector_contains_text(page: Page, selector, expected_text, timeout=5000):
    try:
        page.wait_for_selector(
            f'{selector} >> text={expected_text}', timeout=timeout)
        return True
    except:
        return False

