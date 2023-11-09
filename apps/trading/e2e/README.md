# Console-Test

`console-test` is a repository containing end-to-end tests for a console application using vega-market-sim. This README will guide you through setting up your environment and running the tests.

## Prerequisites

- [Poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)
- [Docker](https://www.docker.com/)
- [Python versions ">=3.9,<3.11"](https://www.python.org/)

## Getting Started

1. **Install Poetry**: Follow the instructions on the [official Poetry website](https://python-poetry.org/docs/#installing-with-the-official-installer).

1. **Install Docker**: Follow the instructions on the [official Docker website](https://docs.docker.com/desktop/).
1. **Install Python**: Follow the instructions on the [official Python website](https://www.python.org/)
   **ensure you install a version between 3.9 and 3.11.**

1. **Install Playwright**:
   Execute the command below to Install Playwright.

   ```bash
   playwright install chromium
   ```

1. **Set Up a Poetry Environment**:
   Execute the command below to configure the Poetry environment.

   ```bash
   cd apps/trading/e2e
   ```

   ```bash
   poetry shell
   ```

   ```bash
   poetry install
   ```

1. **Download Necessary Binaries**:
   Use the following command within your Python environment. The `--force` flag ensures the binaries are overwritten, and the `--version` specifies the desired version. e.g. `v0.73.1`

   ```bash
   python -m vega_sim.tools.load_binaries --force --version $VEGA_VERSION
   ```

## You now have two options:

### Pull the Docker Image of the Trading App

Pull the desired image:

```bash
docker pull vegaprotocol/trading:develop
```

or

```bash
docker pull vegaprotocol/trading:main
```

Find all available images on [Docker Hub](https://hub.docker.com/r/vegaprotocol/trading/tags).

### Create a Docker Image of Your Locally Built Trading App

To build your Docker image, use the following commands:

```bash
yarn nx build trading ./docker/prepare-dist.sh docker build -f docker/node-outside-docker.Dockerfile --build-arg APP=trading --build-arg ENV_NAME=stagnet1 -t vegaprotocol/trading:latest .
```

## **Launching Docker** 🐳

Ensure the Docker daemon is running.

## Running Specific Tests 🧪

To run a specific test, use the `-k` option followed by the name of the test.

### From within the e2e folder:

```bash
cd apps/trading/e2e
```

```bash
poetry run pytest -k "test_name" -s
```

### From anywhere:

```bash
yarn trading:test -- "test_name" -s
```

## Running Tests in Parallel 🔢

To run tests in parallel, use the `--numprocesses auto` option. The `--dist loadfile` setting ensures that multiple runners are not assigned to a single test file.

### From within the console-test folder:

```bash
cd apps/trading/e2e
```

```bash
poetry run pytest -s --numprocesses auto --dist loadfile
```

### From anywhere:

```bash
yarn trading:test:all
```
