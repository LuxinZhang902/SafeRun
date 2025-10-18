#!/usr/bin/env tsx
import { Daytona } from '@daytonaio/sdk';

interface SandboxOptions {
  repoUrl?: string;
  image?: string;
  memory?: number;
  cloneRepo?: boolean;
}

async function createSandbox(options: SandboxOptions = {}) {
  const {
    repoUrl = 'https://github.com/vercel/next-learn-starter',
    image = 'ubuntu:22.04',
    memory = 2,
    cloneRepo = true,
  } = options;

  console.log('='.repeat(70));
  console.log('🚀 Daytona Sandbox Creator');
  console.log('='.repeat(70));
  console.log();

  try {
    // Get API credentials
    const apiKey = process.env.DAYTONA_API_KEY || '';
    const apiUrl = process.env.DAYTONA_BASE_URL || 'https://api.daytona.io';
    
    if (!apiKey) {
      throw new Error('❌ DAYTONA_API_KEY not found in environment variables');
    }

    // Initialize Daytona client
    console.log('📡 Step 1: Initializing Daytona client...');
    const daytona = new Daytona({ apiKey, apiUrl });
    console.log('✅ Client initialized\n');

    // Create sandbox
    console.log('🏗️  Step 2: Creating new sandbox...');
    console.log(`   Image: ${image}`);
    console.log(`   Memory: ${memory} GiB`);
    
    const startCreate = Date.now();
    const sandbox = await daytona.create({
      image,
      resources: { memory },
    });
    const createDuration = ((Date.now() - startCreate) / 1000).toFixed(2);
    
    console.log(`✅ Sandbox created in ${createDuration}s`);
    console.log(`   Sandbox ID: ${sandbox.id}\n`);

    // Clone repository if requested
    if (cloneRepo && repoUrl) {
      console.log('📦 Step 3: Cloning repository...');
      console.log(`   Repository: ${repoUrl}`);
      console.log(`   Target path: repo`);
      
      const startClone = Date.now();
      try {
        await sandbox.git.clone(repoUrl, 'repo');
        const cloneDuration = ((Date.now() - startClone) / 1000).toFixed(2);
        console.log(`✅ Repository cloned in ${cloneDuration}s\n`);
      } catch (error) {
        console.error(`❌ Clone failed: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }

    // Get preview link
    console.log('🔗 Step 4: Getting preview link...');
    try {
      const previewLink = await sandbox.getPreviewLink(3000);
      console.log(`✅ Preview URL: ${previewLink.url}\n`);
    } catch (error) {
      console.log(`⚠️  Could not get preview link: ${error instanceof Error ? error.message : String(error)}\n`);
    }

    // Summary
    console.log('='.repeat(70));
    console.log('✅ Sandbox Ready!');
    console.log('='.repeat(70));
    console.log();
    console.log('📋 Sandbox Details:');
    console.log(`   ID: ${sandbox.id}`);
    console.log(`   Image: ${image}`);
    console.log(`   Memory: ${memory} GiB`);
    if (cloneRepo) {
      console.log(`   Repository: ${repoUrl}`);
      console.log(`   Clone path: /repo`);
    }
    console.log();
    console.log('🌐 Access URLs:');
    console.log(`   Port 3000: https://3000-${sandbox.id}.proxy.daytona.works`);
    console.log(`   Port 3001: https://3001-${sandbox.id}.proxy.daytona.works`);
    console.log(`   Port 8080: https://8080-${sandbox.id}.proxy.daytona.works`);
    console.log();
    console.log('🛠️  Next Steps:');
    console.log('   1. Access the sandbox via preview URL');
    console.log('   2. Run commands using sandbox.process.executeCommand()');
    console.log('   3. Install dependencies: cd repo && pnpm install');
    console.log('   4. Build: npm run build');
    console.log('   5. Start: npm start');
    console.log();
    console.log('🗑️  Cleanup:');
    console.log('   To destroy this sandbox, run:');
    console.log(`   await sandbox.delete()`);
    console.log();

    return sandbox;

  } catch (error) {
    console.error('\n❌ Failed to create sandbox:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: SandboxOptions = {};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--repo':
    case '-r':
      options.repoUrl = args[++i];
      break;
    case '--image':
    case '-i':
      options.image = args[++i];
      break;
    case '--memory':
    case '-m':
      options.memory = parseInt(args[++i]);
      break;
    case '--no-clone':
      options.cloneRepo = false;
      break;
    case '--help':
    case '-h':
      console.log(`
Usage: tsx create-sandbox.ts [options]

Options:
  -r, --repo <url>      Repository URL to clone (default: vercel/next-learn-starter)
  -i, --image <image>   Docker image (default: ubuntu:22.04)
  -m, --memory <gb>     Memory in GiB (default: 2)
  --no-clone            Don't clone repository
  -h, --help            Show this help message

Examples:
  tsx create-sandbox.ts
  tsx create-sandbox.ts --repo https://github.com/user/repo
  tsx create-sandbox.ts --memory 4 --no-clone
  tsx create-sandbox.ts -r https://github.com/user/repo -m 4

Environment Variables:
  DAYTONA_API_KEY       Your Daytona API key (required)
  DAYTONA_BASE_URL      Daytona API URL (default: https://api.daytona.io)
      `);
      process.exit(0);
  }
}

// Run the script
createSandbox(options).catch(console.error);
