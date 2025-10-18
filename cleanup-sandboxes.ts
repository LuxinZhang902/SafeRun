import { daytonaClient } from './apps/api/src/lib/daytona';

async function cleanupSandboxes() {
  console.log('🧹 Cleaning up old Daytona sandboxes...\n');
  
  // List of sandbox IDs to destroy (from your terminal logs)
  const sandboxIds = [
    'e31b440d-9334-4046-b9ca-a70dd0fa812e', // From latest execution
    '85cc08f7-cfd5-4f62-a9cd-1e42c40bc8d6', // From previous execution
    'd2b8488a-1137-4c04-b8c3-a0cb1ba14f7',  // From earlier execution
    'e6d5290b-977b-4d5a-a9b4-719cdd23bff1', // From another execution
    'b3fa6350-3635-4c04-b8c3-a0cb1ba14f7',  // From earlier execution
  ];

  for (const id of sandboxIds) {
    try {
      console.log(`Destroying sandbox: ${id}...`);
      await daytonaClient.destroy(id);
      console.log(`✅ Destroyed: ${id}\n`);
    } catch (error) {
      console.log(`⚠️  Failed to destroy ${id}: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  console.log('✅ Cleanup complete!');
}

cleanupSandboxes().catch(console.error);
