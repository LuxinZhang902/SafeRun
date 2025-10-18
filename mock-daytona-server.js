#!/usr/bin/env node

/**
 * Mock Daytona Server for Local Development
 * This simulates the Daytona API for testing SafeRun without a real Daytona instance
 */

const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = 3986;

app.use(express.json());

// In-memory workspace storage
const workspaces = new Map();
let workspaceCounter = 0;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock Daytona Server Running' });
});

// Create workspace
app.post('/workspace', (req, res) => {
  const { name, image, resources, user } = req.body;
  const workspaceId = `ws-${++workspaceCounter}`;
  
  workspaces.set(workspaceId, {
    id: workspaceId,
    name,
    image,
    resources,
    user,
    status: 'running',
    createdAt: new Date().toISOString(),
  });
  
  console.log(`✅ Created workspace: ${workspaceId} (${name}, ${image})`);
  
  res.json({
    id: workspaceId,
    name,
    status: 'running',
  });
});

// Execute command in workspace
app.post('/workspace/:id/exec', async (req, res) => {
  const { id } = req.params;
  const { command, workdir, env, timeout } = req.body;
  
  const workspace = workspaces.get(id);
  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }
  
  console.log(`🚀 Executing in ${id}: ${command.join(' ')}`);
  
  try {
    // Execute command locally (WARNING: This is for demo only!)
    // Use shell to ensure PATH is properly resolved
    const proc = spawn(command[0], command.slice(1), {
      cwd: workdir || process.cwd(),
      env: { ...process.env, ...env },
      timeout: timeout || 300000,
      shell: true, // Enable shell to resolve commands like git, npm, etc.
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`  stdout: ${data.toString().trim()}`);
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log(`  stderr: ${data.toString().trim()}`);
    });
    
    proc.on('close', (code) => {
      console.log(`  ✓ Exit code: ${code}`);
      res.json({
        stdout,
        stderr,
        exitCode: code,
      });
    });
    
    proc.on('error', (error) => {
      console.error(`  ✗ Error: ${error.message}`);
      res.status(500).json({
        stdout,
        stderr,
        exitCode: 1,
        error: error.message,
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Expose port
app.post('/workspace/:id/expose', (req, res) => {
  const { id } = req.params;
  const { port } = req.body;
  
  const workspace = workspaces.get(id);
  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }
  
  // Mock preview URL
  const previewUrl = `http://localhost:${port}`;
  
  console.log(`🌐 Exposed port ${port} for ${id}: ${previewUrl}`);
  
  res.json({
    url: previewUrl,
    port,
  });
});

// Get workspace
app.get('/workspace/:id', (req, res) => {
  const { id } = req.params;
  const workspace = workspaces.get(id);
  
  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }
  
  res.json(workspace);
});

// Delete workspace
app.delete('/workspace/:id', (req, res) => {
  const { id } = req.params;
  
  if (!workspaces.has(id)) {
    return res.status(404).json({ error: 'Workspace not found' });
  }
  
  workspaces.delete(id);
  console.log(`🗑️  Destroyed workspace: ${id}`);
  
  res.json({ success: true });
});

// List workspaces
app.get('/workspaces', (req, res) => {
  res.json(Array.from(workspaces.values()));
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 Mock Daytona Server Running                      ║
║  📍 http://localhost:${PORT}                            ║
║                                                       ║
║  ⚠️  WARNING: This is a MOCK server for development  ║
║     Commands execute on your LOCAL machine!          ║
║     DO NOT use in production!                        ║
╚═══════════════════════════════════════════════════════╝
  `);
});
