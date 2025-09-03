#!/bin/bash

# Script to run tests with mitigation for Polkadot library incompatibility
# Since Polkadot is always enabled, this script temporarily excludes problematic contracts

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Get the on-chain-relayer package directory (parent of scripts)
PACKAGE_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to package directory
cd "$PACKAGE_DIR"

echo "🚀 Running tests with Polkadot mitigation..."

# Create a temporary directory for excluded contracts
TEMP_DIR=".temp-excluded"
mkdir -p "$TEMP_DIR"
mkdir -p "$TEMP_DIR/mocks"

# Move problematic contracts temporarily
echo "📦 Temporarily excluding Mento contracts with library dependencies..."
if [ -d "contracts/custom-integrations/mento" ]; then
  mv contracts/custom-integrations/mento "$TEMP_DIR/" 2>/dev/null || true
fi

# Also move mock contracts that depend on Mento
if [ -f "contracts/mocks/MentoAdapterMock.sol" ]; then
  mv contracts/mocks/MentoAdapterMock.sol "$TEMP_DIR/mocks/" 2>/dev/null || true
fi
if [ -f "contracts/mocks/MentoAdapterMockV2.sol" ]; then
  mv contracts/mocks/MentoAdapterMockV2.sol "$TEMP_DIR/mocks/" 2>/dev/null || true
fi

# Also exclude test files that depend on Mento contracts
TEMP_TEST_DIR=".temp-excluded-tests"
mkdir -p "$TEMP_TEST_DIR"

if [ -f "test/MentoAdapter.test.ts" ]; then
  mv test/MentoAdapter.test.ts "$TEMP_TEST_DIR/" 2>/dev/null || true
fi
if [ -f "test/MockSortedOracles.test.ts" ]; then
  mv test/MockSortedOracles.test.ts "$TEMP_TEST_DIR/" 2>/dev/null || true
fi

# Function to restore files
restore_files() {
  echo "📥 Restoring excluded contracts and tests..."
  
  # Restore contracts
  if [ -d "$TEMP_DIR/mento" ]; then
    mv "$TEMP_DIR/mento" contracts/custom-integrations/ 2>/dev/null || true
  fi
  if [ -f "$TEMP_DIR/mocks/MentoAdapterMock.sol" ]; then
    mv "$TEMP_DIR/mocks/MentoAdapterMock.sol" contracts/mocks/ 2>/dev/null || true
  fi
  if [ -f "$TEMP_DIR/mocks/MentoAdapterMockV2.sol" ]; then
    mv "$TEMP_DIR/mocks/MentoAdapterMockV2.sol" contracts/mocks/ 2>/dev/null || true
  fi
  
  # Restore test files
  if [ -f "$TEMP_TEST_DIR/MentoAdapter.test.ts" ]; then
    mv "$TEMP_TEST_DIR/MentoAdapter.test.ts" test/ 2>/dev/null || true
  fi
  if [ -f "$TEMP_TEST_DIR/MockSortedOracles.test.ts" ]; then
    mv "$TEMP_TEST_DIR/MockSortedOracles.test.ts" test/ 2>/dev/null || true
  fi
  
  # Clean up temp directories
  rm -rf "$TEMP_DIR" 2>/dev/null
  rm -rf "$TEMP_TEST_DIR" 2>/dev/null
}

# Trap to ensure files are restored even if script is interrupted
trap restore_files EXIT INT TERM

# Run the tests using monorepo hardhat
echo "🧪 Running tests with library-dependent contracts excluded..."
../../node_modules/.bin/hardhat test "$@"
TEST_RESULT=$?

# Restore files (also handled by trap, but explicit call for clarity)
restore_files

if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ All tests passed!"
  echo "ℹ️  Note: Tests for Mento contracts were excluded as they use"
  echo "    Solidity libraries which are not supported by resolc compiler."
else
  echo "❌ Tests failed with exit code $TEST_RESULT"
fi

exit $TEST_RESULT