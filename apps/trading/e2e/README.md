# Trading Market-Sim End-To-End Tests

This directory contains end-to-end tests for the Trading application using Vega-market-sim. This guide will help you set up your environment and run the tests efficiently.

## Prerequisites

Ensure you have the following installed:

- [Poetry](https://python-poetry.org/docs/#installing-with-the-official-installer) for dependency management.
- [Docker](https://www.docker.com/) for running isolated application containers.
- Python, versions ">=3.9,<3.11". Install from the [official Python website](https://www.python.org/).

## Setup

### 1. Install Dependencies

- **Poetry**: Follow the installation guide on the [official Poetry website](https://python-poetry.org/docs/#installing-with-the-official-installer).
- **Docker**: Installation instructions are available on the [official Docker website](https://docs.docker.com/desktop/).
- **Python**: Install a version between 3.9 and 3.11, as detailed on the [official Python website](https://www.python.org/).

### 2. Configure Your Environment

Ensure you're in the tests folder before executing commands.

```bash
poetry shell
poetry update vega-sim  # Updates to the latest version of the market-sim branch
poetry install
playwright install chromium  # Installs necessary browsers for Playwright
```

### 3. Prepare Binaries and Docker Images

Download necessary binaries for the desired Vega version:

```bash
python -m vega_sim.tools.load_binaries --force --version $VEGA_VERSION
```

Pull Docker images for your environment:

- **Development**: `docker pull vegaprotocol/trading:develop`
- **Production**: `docker pull vegaprotocol/trading:main`

### 4. Build a Docker Image of Your Locally Built Trading App

```bash
./docker/prepare-dist.sh
docker build -f docker/node-outside-docker.Dockerfile --build-arg APP=trading --build-arg ENV_NAME=stagnet1 -t vegaprotocol/trading:develop .
```

## Running Tests

Ensure the Docker daemon is running. Update the `.env` file with the correct trading image before proceeding.

- **Run all tests**: `poetry run pytest`
- **Run a specific test**: `poetry run pytest -k "test_name" -s --headed`
- **Run tests using your locally served console**:

  In one terminal window, build and serve the trading console:

  ```bash
  yarn nx build trading
  yarn nx serve trading
  ```

  Once the console is served, update the `.env` file to set `local_server=true`. You can then run your tests using the same commands as above.
  NOTE: Parallel running of tests will not work against locally served console.

## Test Strategy and Container Cleanup

### Strategy

We aim for each test file to use a single Vega instance to ensure test isolation and manage resources efficiently. This approach helps in maintaining test performance and reliability.

### Cleanup Procedure

To ensure proper cleanup of containers after each test, use the following fixture pattern:

```python
@pytest.fixture
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance
```

## Running Tests in Parallel

For running tests in parallel:

- **Within the e2e folder**: `poetry run pytest -s --numprocesses auto --dist loadfile`
- **From anywhere**: `yarn trading:test:all`

## Troubleshooting

If IntelliSense is not working in VSCode, follow these steps:

1. Find the Poetry environment's Python binary: `poetry run which python`
2. In VSCode, open the command menu (`cmd + shift + p`), search for `Python: Select Interpreter`, select `Enter interpreter path`, and paste the path from step 1.
