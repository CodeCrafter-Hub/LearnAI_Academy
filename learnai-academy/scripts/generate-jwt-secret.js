#!/usr/bin/env node

/**
 * Generate a secure JWT_SECRET
 * 
 * Usage:
 *   node scripts/generate-jwt-secret.js
 * 
 * Output:
 *   A base64-encoded random string suitable for JWT_SECRET
 */

const crypto = require('crypto');

// Generate 32 random bytes (256 bits) and encode as base64
const secret = crypto.randomBytes(32).toString('base64');

console.log('\n🔐 Generated JWT_SECRET:');
console.log('─'.repeat(50));
console.log(secret);
console.log('─'.repeat(50));
console.log(`\n✅ Length: ${secret.length} characters (meets 32+ requirement)`);
console.log('\n📋 Copy this value and add it to Vercel Environment Variables:');
console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('   2. Add new variable:');
console.log('      Name: JWT_SECRET');
console.log('      Value: (paste the secret above)');
console.log('      Environment: Production, Preview, Development');
console.log('   3. Click Save');
console.log('   4. Redeploy your application\n');

