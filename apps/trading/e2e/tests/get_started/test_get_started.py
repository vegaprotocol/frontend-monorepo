import pytest
from playwright.sync_api import expect, Page
import json
from vega_sim.service import VegaService
from fixtures.market import setup_simple_market
from conftest import init_vega
from collections import namedtuple
from actions.vega import submit_order
import logging

logger = logging.getLogger()


@pytest.fixture(scope="class")
def vega():
    with init_vega() as vega:
        yield vega


# we can reuse vega market-sim service and market in almost all tests
@pytest.fixture(scope="class")
def simple_market(vega: VegaService):
    return setup_simple_market(vega)

class TestGetStarted:
    @pytest.mark.usefixtures("page")
    def test_get_started_interactive(self, vega: VegaService, page: Page):
        page.goto("/")
        # 0007-FUGS-001
        expect(page.get_by_test_id("order-connect-wallet")).to_be_visible
        expect(page.get_by_test_id("order-connect-wallet")).to_be_enabled
        # 0007-FUGS-006
        # 0007-FUGS-002
        expect(page.locator(".list-none")).to_contain_text(
            "1.Connect2.Deposit funds3.Open a position"
        )
        DEFAULT_WALLET_NAME = "MarketSim"  # This is the default wallet name within VegaServiceNull and CANNOT be changed

        # Calling get_keypairs will internally call _load_tokens for the given wallet
        keypairs = vega.wallet.get_keypairs(DEFAULT_WALLET_NAME)
        wallet_api_token = vega.wallet.login_tokens[DEFAULT_WALLET_NAME]

        # Set token to localStorage so eager connect hook picks it up and immediately connects
        wallet_config = json.dumps(
            {
                "token": f"VWT {wallet_api_token}",
                "connector": "jsonRpc",
                "url": f"http://localhost:{vega.wallet_port}",
            }
        )

        storage_javascript = [
            # Store wallet config so eager connection is initiated
            f"localStorage.setItem('vega_wallet_config', '{wallet_config}');",
            # Ensure wallet ris dialog doesnt show, otherwise eager connect wont work
            "localStorage.setItem('vega_wallet_risk_accepted', 'true');",
            # Ensure initial risk dialog doesnt show
            "localStorage.setItem('vega_risk_accepted', 'true');",
        ]
        script = "".join(storage_javascript)
        page.add_init_script(script)
        page.reload()

        # Assert step 1 complete
        expect(page.get_by_test_id("icon-tick")).to_have_count(1)
        env = json.dumps(
            {
                "VEGA_URL": f"http://localhost:{vega.data_node_rest_port}/graphql",
                "VEGA_WALLET_URL": f"http://localhost:{vega.wallet_port}",
            }
        )
        window_env = f"window._env_ = Object.assign({{}}, window._env_, {env})"
        page.add_init_script(script=window_env)

        page.reload()

        # Defined namedtuples
        WalletConfig = namedtuple("WalletConfig", ["name", "passphrase"])

        # Wallet Configurations
        MM_WALLET = WalletConfig("mm", "pin")
        MM_WALLET2 = WalletConfig("mm2", "pin2")
        TERMINATE_WALLET = WalletConfig("FJMKnwfZdd48C8NqvYrG", "bY3DxwtsCstMIIZdNpKs")

        wallets = [MM_WALLET, MM_WALLET2, TERMINATE_WALLET]

        mint_amount: float = 10e5

        for wallet in wallets:
            vega.create_key(wallet.name)

        vega.mint(
            MM_WALLET.name,
            asset="VOTE",
            amount=mint_amount,
        )

        vega.forward("10s")
        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        vega.create_asset(
            MM_WALLET.name,
            name="tDAI",
            symbol="tDAI",
            decimals=5,
            max_faucet_amount=1e10,
        )
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        tdai_id = vega.find_asset_id(symbol="tDAI")
        logger.info(f"tDAI: {tdai_id}")

        vega.mint(
            "Key 1",
            asset=tdai_id,
            amount=10,
        )

        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        # Assert step 2 complete
        expect(page.get_by_test_id("icon-tick")).to_have_count(2)

        market_id = vega.create_simple_market(
            "tDAI",
            proposal_key=MM_WALLET.name,
            settlement_asset_id=tdai_id,
            termination_key=TERMINATE_WALLET.name,
            market_decimals=5,
            approve_proposal=True,
            forward_time_to_enactment=True,
        )

        vega.forward("10s")
        vega.wait_fn(1)
        vega.wait_for_total_catchup()

        submit_order(vega, "Key 1", market_id, "SIDE_BUY", 1, 110)
        vega.forward("10s")
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        page.get_by_test_id("get-started-button").click()
        # Assert dialog isn't visible
        expect(page.get_by_test_id("welcome-dialog")).not_to_be_visible()
        
        
    @pytest.mark.usefixtures("page", "risk_accepted")
    def test_get_started_seen_already(self, simple_market, page: Page):
        page.goto(f"/#/markets/{simple_market}")
        get_started_locator = page.get_by_test_id("connect-vega-wallet")
        page.wait_for_selector('[data-testid="connect-vega-wallet"]', state="attached")
        expect(get_started_locator).to_be_enabled
        expect(get_started_locator).to_be_visible
        # 0007-FUGS-015
        expect(get_started_locator).to_have_text("Get started")
        get_started_locator.click()
        # 0007-FUGS-007
        expect(page.get_by_test_id("dialog-content").nth(1)).to_be_visible()


    @pytest.mark.usefixtures("page")
    def test_browser_wallet_installed(self, simple_market, page: Page):
        page.add_init_script("window.vega = {}")
        page.goto(f"/#/markets/{simple_market}")
        locator = page.get_by_test_id("connect-vega-wallet")
        page.wait_for_selector('[data-testid="connect-vega-wallet"]', state="attached")
        expect(locator).to_be_enabled
        expect(locator).to_be_visible
        expect(locator).to_have_text("Connect")


    @pytest.mark.usefixtures("page", "risk_accepted")
    def test_get_started_deal_ticket(self,simple_market, page: Page):
        page.goto(f"/#/markets/{simple_market}")
        expect(page.get_by_test_id("order-connect-wallet")).to_have_text("Connect wallet")


    @pytest.mark.usefixtures("page", "risk_accepted")
    def test_browser_wallet_installed_deal_ticket(simple_market, page: Page):
        page.add_init_script("window.vega = {}")
        page.goto(f"/#/markets/{simple_market}")
        # 0007-FUGS-013
        page.wait_for_selector('[data-testid="sidebar-content"]', state="visible")
        expect(page.get_by_test_id("get-started-banner")).not_to_be_visible()

    @pytest.mark.usefixtures("page")
    def test_redirect_default_market(self, continuous_market, vega: VegaService, page: Page):
        page.goto("/")
        # 0007-FUGS-012
        expect(page).to_have_url(
            f"http://localhost:{vega.console_port}/#/markets/{continuous_market}"
        )
        page.get_by_test_id("icon-cross").click()
        # 0007-FUGS-018
        expect(page.get_by_test_id("welcome-dialog")).not_to_be_visible()

class TestBrowseAll: 
    @pytest.mark.usefixtures("page")
    def test_get_started_browse_all(self, simple_market, vega: VegaService, page: Page):
        page.goto("/")
        print(simple_market)
        page.get_by_test_id("browse-markets-button").click()
        # 0007-FUGS-005
        expect(page).to_have_url(f"http://localhost:{vega.console_port}/#/markets/{simple_market}")