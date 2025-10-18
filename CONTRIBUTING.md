# Contributing to Initium

Thank you for your interest in contributing to Initium! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/initium.git
   cd initium
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

## Project Structure

- `apps/api/` - Fastify backend API
- `apps/web/` - Next.js frontend
- `examples/` - Example plan YAML files

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing

- Write unit tests for new features
- Run tests before submitting PR: `pnpm test`
- Ensure all tests pass

## Submitting Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update README if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Test changes
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure CI checks pass

## Adding New Runtime Support

To add support for a new runtime (e.g., Ruby, Java):

1. Update `executor.ts` verb mapper:
   ```typescript
   const isRuby = runtime.includes('ruby');
   
   case 'install':
     if (isRuby) return ['bundle', 'install', ...args];
   ```

2. Add tests in `executor.test.ts`

3. Update README with new runtime support

## Security Guidelines

- Never commit API keys or secrets
- Validate all user inputs
- Use Zod schemas for data validation
- Follow principle of least privilege
- Report security issues privately

## Questions?

Open an issue for questions or discussions.

Thank you for contributing! 🎉
