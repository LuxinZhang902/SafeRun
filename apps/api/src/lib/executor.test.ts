import { describe, it, expect } from 'vitest';

// Test the verb mapper logic
describe('executor verb mapper', () => {
  // Helper function to simulate verb mapping
  function mapVerbToCommand(verb: string, runtime: string, args: string[] = []): string[] {
    const isNode = runtime.includes('node');
    const isPython = runtime.includes('python');
    const isRust = runtime.includes('rust');
    const isGo = runtime.includes('go');

    switch (verb) {
      case 'install':
        if (isNode) return ['pnpm', 'install', ...args];
        if (isPython) return ['pip', 'install', '-r', 'requirements.txt', ...args];
        if (isRust) return ['cargo', 'fetch', ...args];
        if (isGo) return ['go', 'mod', 'download', ...args];
        throw new Error(`Unsupported runtime for install: ${runtime}`);

      case 'build':
        if (isNode) return ['npm', 'run', 'build', ...args];
        if (isRust) return ['cargo', 'build', '--release', ...args];
        if (isGo) return ['go', 'build', ...args];
        throw new Error(`Unsupported runtime for build: ${runtime}`);

      case 'run':
        if (isNode) return ['npm', 'start', ...args];
        if (isPython) return ['python', args[0] || 'main.py', ...args.slice(1)];
        if (isRust) return ['cargo', 'run', '--release', ...args];
        if (isGo) return ['go', 'run', '.', ...args];
        throw new Error(`Unsupported runtime for run: ${runtime}`);

      case 'test':
        if (isNode) return ['npm', 'test', ...args];
        if (isPython) return ['pytest', ...args];
        if (isRust) return ['cargo', 'test', ...args];
        if (isGo) return ['go', 'test', './...', ...args];
        throw new Error(`Unsupported runtime for test: ${runtime}`);

      default:
        throw new Error(`Unknown verb: ${verb}`);
    }
  }

  describe('Node.js runtime', () => {
    it('should map install verb', () => {
      expect(mapVerbToCommand('install', 'node:20')).toEqual(['pnpm', 'install']);
    });

    it('should map build verb', () => {
      expect(mapVerbToCommand('build', 'node:20')).toEqual(['npm', 'run', 'build']);
    });

    it('should map run verb', () => {
      expect(mapVerbToCommand('run', 'node:20')).toEqual(['npm', 'start']);
    });

    it('should map test verb', () => {
      expect(mapVerbToCommand('test', 'node:20')).toEqual(['npm', 'test']);
    });

    it('should include additional args', () => {
      expect(mapVerbToCommand('install', 'node:20', ['--frozen-lockfile'])).toEqual([
        'pnpm',
        'install',
        '--frozen-lockfile',
      ]);
    });
  });

  describe('Python runtime', () => {
    it('should map install verb', () => {
      expect(mapVerbToCommand('install', 'python:3.11')).toEqual([
        'pip',
        'install',
        '-r',
        'requirements.txt',
      ]);
    });

    it('should map run verb with default file', () => {
      expect(mapVerbToCommand('run', 'python:3.11')).toEqual(['python', 'main.py']);
    });

    it('should map run verb with custom file', () => {
      expect(mapVerbToCommand('run', 'python:3.11', ['app.py'])).toEqual(['python', 'app.py']);
    });

    it('should map test verb', () => {
      expect(mapVerbToCommand('test', 'python:3.11')).toEqual(['pytest']);
    });
  });

  describe('Rust runtime', () => {
    it('should map install verb', () => {
      expect(mapVerbToCommand('install', 'rust:1.75')).toEqual(['cargo', 'fetch']);
    });

    it('should map build verb', () => {
      expect(mapVerbToCommand('build', 'rust:1.75')).toEqual(['cargo', 'build', '--release']);
    });

    it('should map run verb', () => {
      expect(mapVerbToCommand('run', 'rust:1.75')).toEqual(['cargo', 'run', '--release']);
    });

    it('should map test verb', () => {
      expect(mapVerbToCommand('test', 'rust:1.75')).toEqual(['cargo', 'test']);
    });
  });

  describe('Go runtime', () => {
    it('should map install verb', () => {
      expect(mapVerbToCommand('install', 'golang:1.21')).toEqual(['go', 'mod', 'download']);
    });

    it('should map build verb', () => {
      expect(mapVerbToCommand('build', 'golang:1.21')).toEqual(['go', 'build']);
    });

    it('should map run verb', () => {
      expect(mapVerbToCommand('run', 'golang:1.21')).toEqual(['go', 'run', '.']);
    });

    it('should map test verb', () => {
      expect(mapVerbToCommand('test', 'golang:1.21')).toEqual(['go', 'test', './...']);
    });
  });

  describe('Error handling', () => {
    it('should throw for unsupported runtime', () => {
      expect(() => mapVerbToCommand('install', 'ruby:3.0')).toThrow(
        'Unsupported runtime for install'
      );
    });

    it('should throw for unknown verb', () => {
      expect(() => mapVerbToCommand('deploy', 'node:20')).toThrow('Unknown verb');
    });

    it('should throw for unsupported verb/runtime combination', () => {
      expect(() => mapVerbToCommand('build', 'python:3.11')).toThrow(
        'Unsupported runtime for build'
      );
    });
  });
});
