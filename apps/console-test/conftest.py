import logging
import docker
import pytest
import os
import json
import requests
import time
import subprocess
import socket

from contextlib import contextmanager
from vega_sim.null_service import VegaServiceNull
from playwright.sync_api import Browser, Page
from config import console_image_name, vega_version
from fixtures.market import (
    setup_simple_market,
    setup_opening_auction_market,
    setup_continuous_market,
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

""" @pytest.fixture(scope="session", autouse=True)
def build_trading_platform():
    # Build the trading platform before any tests run
    print("Building the trading platform...")
    subprocess.run(["yarn", "nx", "build", "trading"], check=True) """

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        s.listen(1)
        return s.getsockname()[1]

# Start VegaServiceNull and start up docker container for website
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
            # Start the development server
            port = find_free_port()
            env = os.environ.copy()
            env["PORT"] = str(port)
            logger.info(f"Starting the trading platform server on port {port}...")
            serve_command = ["yarn", "nx", "serve", "trading", "--port", str(port)]
            serve_process = subprocess.Popen(serve_command, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            #TODO add proper check for server
            logger.info("Waiting for the server to start...")
            time.sleep(10)  # Adjust this time as necessary.
            yield vega, port
        finally:
            # Shutdown actions below this line
            logger.info("Shutting down the trading platform server...")
            serve_process.terminate()
            try:
                serve_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                serve_process.kill()
                logger.info("Server did not shut down gracefully, forcefully terminated.")


@contextmanager
def init_page(vega: VegaServiceNull, port, browser: Browser, request: pytest.FixtureRequest):
    with browser.new_context(
        viewport={"width": 1920, "height": 1080},
        base_url=f"http://localhost:{port}",
    ) as context, context.new_page() as page:
        context.tracing.start(screenshots=True, snapshots=True, sources=True)
        try:
            # Wait for the console to be up and running before any tests are run
            attempts = 0
            while attempts < 100:
                try:
                    code = requests.get(
                        f"http://localhost:{port}/"
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

            # Set window._env_ so built docker image data uses datanode from vega market sim
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
            if not os.path.exists("traces"):
                os.makedirs("traces")

            # Check whether this test failed or passed
            outcome = request.config.cache.get(request.node.nodeid, None)
            if outcome != "passed":
                try:
                    trace_path = os.path.join("traces", request.node.name + "trace.zip")
                    context.tracing.stop(path=trace_path)
                except Exception as e:
                    logger.error(f"Failed to save trace: {e}")

@pytest.fixture()
def vega_port(request):
    with init_vega(request) as vega_instance:
        _, port = vega_instance  # Unpack only port here if you want to yield just the port.
        yield port

@pytest.fixture
def vega(request):
    with init_vega(request) as vega_tuple:
        vega, _ = vega_tuple
        yield vega


@pytest.fixture
def page(vega, vega_port, browser, request):
    with init_page(vega, vega_port, browser, request) as page_instance:
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
