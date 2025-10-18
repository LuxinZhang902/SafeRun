#!/usr/bin/env tsx
import { Daytona } from '@daytonaio/sdk';

async function manageSandboxes(action: string, sandboxId?: string) {
  console.log('='.repeat(70));
  console.log('🛠️  Daytona Sandbox Manager');
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
    const daytona = new Daytona({ apiKey, apiUrl });

    switch (action) {
      case 'info':
        if (!sandboxId) {
          console.error('❌ Sandbox ID required for info command');
          process.exit(1);
        }
        await showSandboxInfo(sandboxId);
        break;

      case 'url':
        if (!sandboxId) {
          console.error('❌ Sandbox ID required for url command');
          process.exit(1);
        }
        await showUrls(sandboxId);
        break;

      default:
        console.error(`❌ Unknown action: ${action}`);
        showHelp();
        process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

function showSandboxInfo(sandboxId: string) {
  console.log('📋 Sandbox Information:');
  console.log(`   ID: ${sandboxId}`);
  console.log();
  console.log('🌐 Access URLs:');
  showUrls(sandboxId);
}

function showUrls(sandboxId: string) {
  const ports = [3000, 3001, 8000, 8080, 5000, 4200];
  console.log();
  ports.forEach(port => {
    console.log(`   Port ${port}: https://${port}-${sandboxId}.proxy.daytona.works`);
  });
  console.log();
}

function showHelp() {
  console.log(`
Usage: tsx manage-sandboxes.ts <action> [sandbox-id]

Actions:
  info <id>     Show sandbox information
  url <id>      Show preview URLs for sandbox

Examples:
  tsx manage-sandboxes.ts info 4f6f2980-4cc8-4971-901b-4af84657a719
  tsx manage-sandboxes.ts url 4f6f2980-4cc8-4971-901b-4af84657a719

Environment Variables:
  DAYTONA_API_KEY       Your Daytona API key (required)
  DAYTONA_BASE_URL      Daytona API URL (default: https://api.daytona.io)
  `);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  showHelp();
  process.exit(0);
}

const action = args[0];
const sandboxId = args[1];

manageSandboxes(action, sandboxId).catch(console.error);
