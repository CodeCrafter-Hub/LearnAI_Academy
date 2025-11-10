/**
 * Test Video API Configuration
 * 
 * This script tests the video generation and storage API connections
 * Run with: node scripts/test-video-apis.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function testVideoGenerationAPI() {
  console.log('\n🎬 Testing Video Generation API...\n');

  const provider = process.env.VIDEO_GENERATION_PROVIDER || 'heygen';
  const apiKey = process.env.VIDEO_GENERATION_API_KEY;

  if (!apiKey) {
    console.log('❌ VIDEO_GENERATION_API_KEY not set');
    console.log('   Set it in your .env.local file');
    return false;
  }

  console.log(`Provider: ${provider}`);
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);

  try {
    let testUrl, testHeaders, testBody;

    switch (provider) {
      case 'heygen':
        testUrl = 'https://api.heygen.com/v1/video/generate';
        testHeaders = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        testBody = {
          avatar_id: process.env.VIDEO_AVATAR_ID || 'default',
          voice_id: process.env.VIDEO_VOICE_ID || 'default',
          text: 'This is a test video generation request.',
        };
        break;

      case 'd-id':
        testUrl = 'https://api.d-id.com/talks';
        testHeaders = {
          'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        };
        testBody = {
          source_url: process.env.VIDEO_AVATAR_ID || 'default_avatar_url',
          script: {
            type: 'text',
            input: 'This is a test video generation request.',
            provider: {
              type: 'microsoft',
              voice_id: process.env.VIDEO_VOICE_ID || 'en-US-JennyNeural',
            },
          },
        };
        break;

      default:
        console.log(`❌ Unsupported provider: ${provider}`);
        return false;
    }

    console.log(`\nTesting ${provider} API...`);
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify(testBody),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Video Generation API is working!');
      console.log(`   Status: ${result.status || 'success'}`);
      if (result.video_id || result.id) {
        console.log(`   Video ID: ${result.video_id || result.id}`);
      }
      return true;
    } else {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.log(`❌ Video Generation API error: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${error.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Video Generation API test failed: ${error.message}`);
    return false;
  }
}

async function testCloudflareR2() {
  console.log('\n☁️  Testing Cloudflare R2 Storage...\n');

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  const required = { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.log('❌ Missing Cloudflare R2 configuration:');
    missing.forEach(key => {
      console.log(`   - ${key.toUpperCase().replace(/_/g, '_')}`);
    });
    console.log('\n   Set these in your .env.local file');
    return false;
  }

  console.log(`Account ID: ${accountId}`);
  console.log(`Bucket: ${bucketName}`);
  console.log(`Public URL: ${publicUrl}`);

  try {
    // Try to import AWS SDK
    const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Test connection by listing buckets
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    if (response.Buckets) {
      const bucketExists = response.Buckets.some(b => b.Name === bucketName);
      if (bucketExists) {
        console.log('✅ Cloudflare R2 is configured and accessible!');
        console.log(`   Bucket "${bucketName}" exists`);
        return true;
      } else {
        console.log(`⚠️  Cloudflare R2 is accessible, but bucket "${bucketName}" not found`);
        console.log('   Available buckets:');
        response.Buckets.forEach(b => console.log(`     - ${b.Name}`));
        return false;
      }
    }

    return false;
  } catch (error) {
    if (error.message.includes('not installed')) {
      console.log('❌ AWS SDK not installed');
      console.log('   Run: npm install @aws-sdk/client-s3');
    } else {
      console.log(`❌ Cloudflare R2 test failed: ${error.message}`);
      console.log('   Check your credentials and account ID');
    }
    return false;
  }
}

async function main() {
  console.log('🧪 Video API Configuration Test\n');
  console.log('='.repeat(50));

  const videoGenResult = await testVideoGenerationAPI();
  const r2Result = await testCloudflareR2();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:\n');
  console.log(`Video Generation API: ${videoGenResult ? '✅ Working' : '❌ Not configured'}`);
  console.log(`Cloudflare R2 Storage: ${r2Result ? '✅ Working' : '❌ Not configured'}`);

  if (videoGenResult && r2Result) {
    console.log('\n🎉 All video APIs are configured and working!');
    console.log('   You can now generate video lessons.');
  } else {
    console.log('\n⚠️  Some APIs are not configured.');
    console.log('   See VIDEO_API_CONFIGURATION.md for setup instructions.');
  }

  console.log('');
}

main().catch(console.error);

