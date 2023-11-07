#!/bin/bash
run_indented() {
  local indent=${INDENT:-"    "}
  { "$@" 2> >(sed "s/^/$indent/g" >&2); } | sed "s/^/$indent/g"
}
bold=$(tput bold)
normal=$(tput sgr0)

# The name of the application to check.
APPLICATION="vega"
DEBUG=false


for arg in "$@"; do
  if [ "$arg" = "debug" ]; then
    # Set the flag to false if 'notidyup' is found
    DEBUG=true
    break
  fi
done


echo "${bold}# Setup${normal}"
# Check if the application exists.
if command -v "$APPLICATION" &> /dev/null; then
    # Run the application if it exists.
    run_indented "$APPLICATION" version
else
    # Print an error message if the application doesn't exist.
    echo "Error: $APPLICATION is not installed."
    # Exit with a non-zero exit code to indicate failure.
    exit 1
fi

echo ""
echo "${bold}# Generating genesis${normal}"
run_indented vegacapsule template genesis --path genesis.tmpl > genesis.tmp
run_indented tail -n +3 genesis.tmp > genesis.json
run_indented rm genesis.tmp

if jq empty "genesis.json" &> /dev/null; then
    run_indented echo ""
    run_indented echo "${bold}The genesis.json file is valid JSON.${normal}"
else
    run_indented echo ""
    run_indented echo "${bold}The genesis.json file is invalid JSON.${normal}"
    # Exit with a non-zero exit code to indicate failure
    exit 1
fi

if $DEBUG; then
  run_indented cat genesis.json
fi

echo ""
echo "${bold}# Verifying genesis${normal}"
run_indented vega verify genesis genesis.json
echo ""

# Tidy up
if [[ "$DEBUG" == "false" ]]; then
  run_indented rm genesis.json
fi
