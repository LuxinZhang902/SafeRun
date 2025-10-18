import { Daytona } from '@daytonaio/sdk';

async function testDaytona() {
  console.log('🧪 Testing Daytona SDK...\n');
  
  try {
    // Initialize Daytona client
    console.log('1. Initializing Daytona client...');
    const apiKey = process.env.DAYTONA_API_KEY || '';
    const apiUrl = process.env.DAYTONA_BASE_URL || 'https://api.daytona.io';
    
    if (!apiKey) {
      throw new Error('DAYTONA_API_KEY not found in environment variables');
    }
    
    const daytona = new Daytona({
      apiKey,
      apiUrl,
    });
    console.log('✅ Client initialized\n');

    // Create a new sandbox
    console.log('2. Creating new sandbox...');
    const sandbox = await daytona.create({
      image: 'ubuntu:22.04',
      resources: {
        memory: 2, // 2 GiB
      },
    });
    console.log(`✅ Sandbox created: ${sandbox.id}\n`);

    // Test git clone
    console.log('3. Testing git clone...');
    console.log('   Repository: https://github.com/vercel/next-learn-starter');
    console.log('   Target path: repo');
    console.log('   Starting clone...\n');
    
    const startTime = Date.now();
    
    try {
      await sandbox.git.clone('https://github.com/vercel/next-learn-starter', 'repo');
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Git clone successful! (${duration}s)\n`);
      
      // Test getting preview link
      console.log('4. Getting preview link for port 3000...');
      const previewLink = await sandbox.getPreviewLink(3000);
      console.log(`✅ Preview URL: ${previewLink.url}\n`);
      
      console.log('🎉 All tests passed!\n');
      console.log(`Sandbox ID: ${sandbox.id}`);
      console.log(`Preview URL: ${previewLink.url}`);
      console.log('\nYou can access this sandbox at the preview URL.');
      console.log('Remember to destroy it when done: await sandbox.delete()');
      
    } catch (cloneError) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`❌ Git clone failed after ${duration}s`);
      console.error('Error:', cloneError);
      
      // Try to get preview link anyway
      try {
        console.log('\n5. Attempting to get preview link anyway...');
        const previewLink = await sandbox.getPreviewLink(3000);
        console.log(`Preview URL: ${previewLink.url}`);
        console.log(`Sandbox ID: ${sandbox.id}`);
      } catch (linkError) {
        console.error('Could not get preview link:', linkError);
      }
      
      throw cloneError;
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

console.log('='.repeat(60));
console.log('Daytona SDK Test');
console.log('='.repeat(60));
console.log();

testDaytona().catch(console.error);
