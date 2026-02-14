import bcrypt from 'bcryptjs';

const HASH = '$2a$10$qldHQcimwuB5FEj3WoLpeeZcsh7BERM7M.fsRO48WL4xryss.322G';

// Common PINs to test
const COMMON_PINS = ['1234', '0000', '1111', '12345', '123456', '5678', 'admin', 'password', '123', '2024', '2025', '00000', '111111'];

async function testPins() {
  console.log('Testing common PINs against the admin hash...\n');
  console.log(`Hash: ${HASH.substring(0, 30)}...\n`);
  
  for (const pin of COMMON_PINS) {
    const match = bcrypt.compareSync(pin, HASH);
    if (match) {
      console.log(`\n✅ SUCCESS! The admin PIN is: ${pin}`);
      return pin;
    } else {
      console.log(`❌ ${pin} - no match`);
    }
  }
  
  console.log('\n❌ None of the common PINs matched.');
  console.log('\nTo test a specific PIN, modify this script or run:');
  console.log('node -e "const bcrypt=require(\'bcryptjs\'); console.log(bcrypt.compareSync(\'YOUR_PIN\', \'$2a$10$qldHQcimwuB5FEj3WoLpeeZcsh7BERM7M.fsRO48WL4xryss.322G\'))"');
  return null;
}

testPins().catch(console.error);
