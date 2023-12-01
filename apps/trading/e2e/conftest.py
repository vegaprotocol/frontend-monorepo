import logging
import pytest
import os
import json
import requests
import time
import docker
import http.server


from contextlib import contextmanager
from vega_sim.null_service import VegaServiceNull
from playwright.sync_api import Browser, Page
from config import console_image_name, vega_version
from fixtures.market import (
    setup_simple_market,
    setup_opening_auction_market,
    setup_continuous_market,
    setup_perps_market,
)

import sys

# Workaround for current xdist issue with displaying live logs from multiple workers
# https://github.com/pytest-dev/pytest-xdist/issues/402
sys.stdout = sys.stderr

docker_client = docker.from_env()
logger = logging.getLogger()


@pytest.hookimpl(tryfirst=True)
def pytest_runtest_makereport(item, call):
    outcome = "passed" if call.excinfo is None else "failed"
    item.config.cache.set(item.nodeid, outcome)


def pytest_configure(config):
    worker_id = os.environ.get("PYTEST_XDIST_WORKER")
    if worker_id is not None:
        log_dir = os.path.join(os.getcwd(), "logs")
        log_name = f"tests_{worker_id}.log"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        logging.basicConfig(
            format=config.getini("log_file_format"),
            datefmt=config.getini("log_file_date_format"),
            filename=os.path.join(log_dir, log_name),
            level=config.getini("log_file_level"),
        )

class CustomHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Set the path to your website's directory here
        if self.path == '/':
            self.path = 'dist/apps/trading/exported/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Start VegaServiceNull
@contextmanager
def init_vega(request=None):
    default_seconds = 1
    seconds_per_block = default_seconds
    if request and hasattr(request, "param"):
        seconds_per_block = request.param

    logger.info(
        "Starting VegaServiceNull",
        extra={"worker_id": os.environ.get("PYTEST_XDIST_WORKER")},
    )
    logger.info(f"Using console image: {console_image_name}")
    logger.info(f"Using vega version: {vega_version}")
    with VegaServiceNull(
        run_with_console=False,
        launch_graphql=False,
        retain_log_files=True,
        use_full_vega_wallet=True,
        store_transactions=True,
        transactions_per_block=1000,
        seconds_per_block=seconds_per_block,
    ) as vega:
        try:
            container = docker_client.containers.run(
                console_image_name, detach=True, ports={"80/tcp": vega.console_port}
            )
            # docker setup
            logger.info(
                f"Container {container.id} started",
                extra={"worker_id": os.environ.get("PYTEST_XDIST_WORKER")},
            )
            yield vega
        except docker.errors.APIError as e:
            logger.info(f"Container creation failed.")
            logger.info(e)
            raise e
        finally:
            logger.info(f"Stopping container {container.id}")
            container.stop()
            # Remove the container
            logger.info(f"Removing container {container.id}")
            container.remove()

@contextmanager
def init_page(vega: VegaServiceNull, browser: Browser, request: pytest.FixtureRequest):
    with browser.new_context(
        viewport={"width": 1920, "height": 1080},
        base_url=f"http://localhost:{vega.console_port}",
    ) as context, context.new_page() as page:
        context.tracing.start(screenshots=True, snapshots=True, sources=True)
        try:
            # Wait for the console to be up and running before any tests are run
            attempts = 0
            while attempts < 100:
                try:
                    code = requests.get(
                        f"http://localhost:{vega.console_port}/"
                    ).status_code
                    if code == 200:
                        break
                except requests.exceptions.ConnectionError as e:
                    attempts += 1
                    if attempts < 100:
                        time.sleep(0.1)
                        continue
                    else:
                        raise e

            # Set window._env_ so built app uses datanode from vega market sim
            env = json.dumps(
                {
                    "VEGA_URL": f"http://localhost:{vega.data_node_rest_port}/graphql",
                    "VEGA_WALLET_URL": f"http://localhost:{vega.wallet_port}",
                }
            )
            window_env = f"window._env_ = Object.assign({{}}, window._env_, {env})"
            page.add_init_script(script=window_env)
            yield page
        finally:
            try:
                if not os.path.exists("apps/trading/e2e/traces"):
                    os.makedirs("apps/trading/e2e/traces")
            except OSError as e:
                print(f"Failed to create directory '{'apps/trading/e2e/traces'}': {e}")

            # Check whether this test failed or passed
            outcome = request.config.cache.get(request.node.nodeid, None)
            if outcome != "passed":
                try:
                    trace_path = os.path.join("traces", request.node.name + "trace.zip")
                    context.tracing.stop(path=trace_path)
                except Exception as e:
                    logger.error(f"Failed to save trace: {e}")


@pytest.fixture
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture
def page(vega, browser, request):
    with init_page(vega, browser, request) as page_instance:
        yield page_instance


# Set auth token so eager connection for MarketSim wallet is successful
def auth_setup(vega: VegaServiceNull, page: Page):
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

    return {
        "wallet": DEFAULT_WALLET_NAME,
        "wallet_api_token": wallet_api_token,
        "public_key": keypairs["Key 1"],
    }


@pytest.fixture(scope="function")
def auth(vega: VegaServiceNull, page: Page):
    return auth_setup(vega, page)


# Set 'risk accepted' flag, so that the risk dialog doesn't show up
def risk_accepted_setup(page: Page):
    onboarding_config = json.dumps({"state": {"dismissed": True}, "version": 0})
    storage_javascript = [
        "localStorage.setItem('vega_risk_accepted', 'true');",
        f"localStorage.setItem('vega_onboarding', '{onboarding_config}');",
        "localStorage.setItem('vega_telemetry_approval', 'false');",
        "localStorage.setItem('vega_telemetry_viewed', 'true');",
    ]
    script = "".join(storage_javascript)
    page.add_init_script(script)


@pytest.fixture(scope="function")
def risk_accepted(page: Page):
    risk_accepted_setup(page)


@pytest.fixture(scope="function")
def simple_market(vega, request):
    kwargs = {}
    if hasattr(request, "param"):
        kwargs.update(request.param)
    return setup_simple_market(vega, **kwargs)


@pytest.fixture(scope="function")
def opening_auction_market(vega):
    return setup_opening_auction_market(vega)


@pytest.fixture(scope="function")
def continuous_market(vega):
    return setup_continuous_market(vega)


@pytest.fixture(scope="function")
def proposed_market(vega):
    return setup_simple_market(vega, approve_proposal=False)


@pytest.fixture(scope="function")
def perps_market(vega, request):
    kwargs = {}
    if hasattr(request, "param"):
        kwargs.update(request.param)
    return setup_perps_market(vega, **kwargs)
