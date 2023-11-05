# Console-Test

`console-test` is a repository containing end-to-end tests for a console application using vega-market-sim. This README will guide you through setting up your environment and running the tests.

## Prerequisites

- [Poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)
- [Docker](https://www.docker.com/)

## Getting Started

1. **Install Poetry**: Follow the instructions on the [official Poetry website](https://python-poetry.org/docs/#installing-with-the-official-installer).
1. **Install Docker**: Follow the instructions on the [offical Docker website](https://docs.docker.com/desktop/).
1. **Install Dependencies**:
   ```bash
   npm run install:console-test
   ```

If you want to run against specific vega binaries you can update the command in package.json

1. **Pull the docker image of the trading app**:
   You can pull the image you want to test, for example:
   ```bash
   docker pull vegaprotocol/trading:develop
   ```
   or
   ```bash
   docker pull vegaprotocol/trading:main
   ```
   All available images can be found [here](https://hub.docker.com/r/vegaprotocol/trading/tags).
1. **Start Docker**: Make sure your Docker daemon is running.

1. **Run the tests**: To run a specific test (or group of tests) using its name, use the following command:
   ```bash
   npm run console-test -- "test_name" -s --headed
   ```

## Running Tests in Parallel

If you want to run tests in parallel, use the --numprocesses auto option. --dist loadfile makes sure that there are no multiple runners assigned to single test file:

```bash
npm run console-test:all
```
