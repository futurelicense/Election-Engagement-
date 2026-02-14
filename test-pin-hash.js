#!/usr/bin/env node
/**
 * Utility to test PIN against bcrypt hash
 * Usage: node test-pin-hash.js <pin>
 */

const readline = require('readline');

const HASH = '$2a$10$qldHQcimwuB5FEj3WoLpeeZcsh7BERM7M.fsRO48WL4xryss.322G';

// Common PINs to test (4-6 digits)
const COMMON_PINS = [
  '1234',
  '0000',
  '1111',
  '12345',
  '123456',
  '5678',
  '00000',
  '111111',
  '12345678',
  'admin',
  'password',
  '123',
  '1230',
  '2024',
  '2025',
];

async function testPin(pin) {
  try {
    // Try with bcryptjs first (lighter weight)
    try {
      const bcrypt = require('bcryptjs');
      const match = await bcrypt.compare(pin, HASH);
      return match;
    } catch (e) {
      // Fallback to bcrypt if bcryptjs not available
      const bcrypt = require('bcrypt');
      const match = await bcrypt.compareSync(pin, HASH);
      return match;
    }
  } catch (error) {
    console.error('Error testing PIN:', error.message);
    console.error('\nTo use this script, install bcryptjs:');
    console.error('npm install bcryptjs');
    process.exit(1);
  }
}

async function main() {
  const pin = process.argv[2];

  if (pin) {
    // Test specific PIN
    console.log(`Testing PIN: ${pin}`);
    const match = await testPin(pin);
    if (match) {
      console.log(`✅ MATCH! The PIN is: ${pin}`);
      process.exit(0);
    } else {
      console.log(`❌ PIN "${pin}" does not match the hash`);
      process.exit(1);
    }
  } else {
    // Test common PINs
    console.log('Testing common PINs against the hash...\n');
    console.log(`Hash: ${HASH}\n`);

    for (const testPin of COMMON_PINS) {
      const match = await testPin(testPin);
      if (match) {
        console.log(`\n✅ FOUND! The PIN is: ${testPin}`);
        process.exit(0);
      } else {
        process.stdout.write(`❌ ${testPin} - no match\n`);
      }
    }

    console.log('\n❌ None of the common PINs matched.');
    console.log('\nTo test a specific PIN, run:');
    console.log(`node test-pin-hash.js <your-pin>`);
  }
}

main().catch(console.error);
