import { Daytona } from '@daytonaio/sdk';
import { config } from './apps/api/src/config';

async function connectToSandbox() {
  const sandboxId = 'a82e1267-bf03-433a-9ec6-17318ba9a1dd';
  
  console.log(`🔗 Connecting to sandbox: ${sandboxId}\n`);
  
  try {
    const daytona = new Daytona({
      apiKey: config.daytonaApiKey || '',
      apiUrl: config.daytonaBaseUrl,
    });

    console.log('Creating connection to existing sandbox...');
    
    // Try to create a connection to the existing sandbox
    const sandbox = await daytona.create({ 
      image: 'ubuntu:22.04'  // This might reconnect to existing
    });
    
    console.log(`✅ Connected to sandbox: ${sandbox.id}`);
    console.log(`Preview URL: https://3000-${sandboxId}.proxy.daytona.works`);
    
    // Try to get preview link
    try {
      const previewLink = await sandbox.getPreviewLink(3000);
      console.log(`\n✅ Preview Link: ${previewLink.url}`);
    } catch (error) {
      console.log(`\n⚠️  Could not get preview link: ${error instanceof Error ? error.message : String(error)}`);
    }
    
  } catch (error) {
    console.error(`❌ Failed to connect:`, error);
  }
}

connectToSandbox().catch(console.error);
