#!/bin/bash

# Script to run Hardhat tests with Polkadot integration
# This script ensures the Polkadot plugin is enabled and runs all tests

echo "🚀 Running Gelato Relayer Tests with Polkadot Integration"
echo "=========================================================="

# Set the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Export Polkadot configuration
export ENABLE_POLKADOT=true
export ETH_RPC_BINARY=./bin/eth-rpc
export DEV_NODE_BINARY=./bin/revive-dev-node
export RESOLC_BINARY=./bin/resolc

# Check if binaries exist
if [ ! -f "$ETH_RPC_BINARY" ]; then
    echo "⚠️  Warning: ETH_RPC_BINARY not found at $ETH_RPC_BINARY"
fi
if [ ! -f "$DEV_NODE_BINARY" ]; then
    echo "⚠️  Warning: DEV_NODE_BINARY not found at $DEV_NODE_BINARY"
fi
if [ ! -f "$RESOLC_BINARY" ]; then
    echo "⚠️  Warning: RESOLC_BINARY not found at $RESOLC_BINARY"
fi

echo ""
echo "📋 Configuration:"
echo "  - ENABLE_POLKADOT: $ENABLE_POLKADOT"
echo "  - ETH_RPC_BINARY: $ETH_RPC_BINARY"
echo "  - DEV_NODE_BINARY: $DEV_NODE_BINARY"
echo "  - RESOLC_BINARY: $RESOLC_BINARY"
echo ""

# Run the tests using the monorepo's hardhat binary
echo "🧪 Running tests..."
../../node_modules/.bin/hardhat test

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ All tests passed successfully!"
else
    echo ""
    echo "❌ Tests failed with exit code: $EXIT_CODE"
fi

exit $EXIT_CODE