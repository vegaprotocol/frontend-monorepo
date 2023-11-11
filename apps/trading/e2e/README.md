# Trading End-To-End Tests

This direcotry contains end-to-end tests for the trading application using vega-market-sim. This README will guide you through setting up your environment and running the tests.

## Prerequisites

- [Poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)
- [Docker](https://www.docker.com/)
- [Python versions ">=3.9,<3.11"](https://www.python.org/)

## Getting Started

1. **Install Poetry**: Follow the instructions on the [official Poetry website](https://python-poetry.org/docs/#installing-with-the-official-installer).

1. **Install Docker**: Follow the instructions on the [official Docker website](https://docs.docker.com/desktop/).
1. **Install Python**: Follow the instructions on the [official Python website](https://www.python.org/)
   **ensure you install a version between 3.9 and 3.11.**
1. **Install playwright**:

```bash
  pip install pytest-playwright
```

1. **Install Playwright**: Execute the command below to Install Playwright.

```bash
playwright install chromium
```

1. **Start up a Poetry environment**: Execute the commands below to configure the Poetry environment.

```bash
poetry shell
```

1. **Install python dependencies**

```bash
poetry install
```

1. **Download necessary binaries**:
   Use the following command within your Python environment. The `--force` flag ensures the binaries are overwritten, and the `--version` specifies the desired version. e.g. `v0.73.1`

```bash
python -m vega_sim.tools.load_binaries --force --version $VEGA_VERSION
```

1. **Pull the desired Docker image**

```bash
docker pull vegaprotocol/trading:develop
```

1. **Run tests**: Poetry/Python will serve the app from docker

```bash
poetry run pytest
```

### Docker images

Pull the desired image:

**Testnet**

```bash
docker pull vegaprotocol/trading:develop
```

**Mainnet**

```bash
docker pull vegaprotocol/trading:main
```

Find all available images on [Docker Hub](https://hub.docker.com/r/vegaprotocol/trading/tags).

#### Create a Docker Image of Your Locally Built Trading App

To build your Docker image, use the following commands:

```bash
yarn nx build trading ./docker/prepare-dist.sh docker build -f docker/node-outside-docker.Dockerfile --build-arg APP=trading --build-arg ENV_NAME=stagnet1 -t vegaprotocol/trading:latest .
```

## Running Tests 🧪

Before running make sure the docker daemon is runnign so that the app can be served.

To run a specific test, use the `-k` option followed by the name of the test.

Run all tests:

```bash
poetry run pytest
```

Run a targeted test:

```bash
poetry run pytest -k "test_name" -s
```

Run from anywhere:

```bash
yarn trading:test -- "test_name" -s
```

## Running Tests in Parallel 🔢

To run tests in parallel, use the `--numprocesses auto` option. The `--dist loadfile` setting ensures that multiple runners are not assigned to a single test file.

### From within the e2e folder:

```bash
poetry run pytest -s --numprocesses auto --dist loadfile
```

### From anywhere:

```bash
yarn trading:test:all
```
