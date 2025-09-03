#!/bin/bash

# Script to compile contracts for Polkadot/PolkaVM
# This temporarily excludes contracts with library dependencies that resolc cannot handle

echo "🚀 Preparing for Polkadot compilation..."

# Create a temporary directory for excluded contracts
TEMP_DIR=".temp-excluded"
mkdir -p "$TEMP_DIR"
mkdir -p "$TEMP_DIR/mocks"

# Move problematic contracts temporarily
echo "📦 Temporarily excluding Mento contracts and their dependencies..."
if [ -d "contracts/custom-integrations/mento" ]; then
  mv contracts/custom-integrations/mento "$TEMP_DIR/"
fi

# Also move mock contracts that depend on Mento
if [ -f "contracts/mocks/MentoAdapterMock.sol" ]; then
  mv contracts/mocks/MentoAdapterMock.sol "$TEMP_DIR/mocks/"
fi
if [ -f "contracts/mocks/MentoAdapterMockV2.sol" ]; then
  mv contracts/mocks/MentoAdapterMockV2.sol "$TEMP_DIR/mocks/"
fi

# Run the compilation with Polkadot plugin
echo "🔨 Compiling contracts for PolkaVM..."
export ENABLE_POLKADOT=true
npx hardhat compile "$@"
COMPILE_RESULT=$?

# Restore the excluded contracts
echo "📥 Restoring excluded contracts..."
if [ -d "$TEMP_DIR/mento" ]; then
  mv "$TEMP_DIR/mento" contracts/custom-integrations/
fi
if [ -f "$TEMP_DIR/mocks/MentoAdapterMock.sol" ]; then
  mv "$TEMP_DIR/mocks/MentoAdapterMock.sol" contracts/mocks/
fi
if [ -f "$TEMP_DIR/mocks/MentoAdapterMockV2.sol" ]; then
  mv "$TEMP_DIR/mocks/MentoAdapterMockV2.sol" contracts/mocks/
fi

# Clean up
rm -rf "$TEMP_DIR" 2>/dev/null

if [ $COMPILE_RESULT -eq 0 ]; then
  echo "✅ Polkadot compilation successful!"
  echo "ℹ️  Note: Mento contracts and related mocks were excluded from this compilation"
  echo "    These contracts use Solidity libraries which are not supported by resolc."
else
  echo "❌ Polkadot compilation failed with exit code $COMPILE_RESULT"
fi

exit $COMPILE_RESULT