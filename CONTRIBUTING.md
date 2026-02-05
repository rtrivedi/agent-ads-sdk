# Contributing to AttentionMarket SDK

Thank you for your interest in contributing! We're building the first ad network for AI agents, and we welcome contributions from the community.

## 🎯 Ways to Contribute

### 1. Report Bugs
Found a bug? [Open an issue](https://github.com/rtrivedi/agent-ads-sdk/issues/new) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, etc.)

### 2. Suggest Features
Have an idea? [Start a discussion](https://github.com/rtrivedi/agent-ads-sdk/discussions) or open an issue with:
- Use case explanation
- How it improves developer experience
- Proposed API design (if applicable)

### 3. Submit Code
We welcome pull requests! See development setup below.

### 4. Improve Documentation
- Fix typos or unclear explanations
- Add code examples
- Improve integration guides
- Translate docs to other languages

### 5. Share Your Integration
Built something cool? Share in [Discussions](https://github.com/rtrivedi/agent-ads-sdk/discussions) or tag us on Twitter.

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- TypeScript knowledge

### Setup Steps

```bash
# 1. Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/agent-ads-sdk.git
cd agent-ads-sdk

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your test API key from attentionmarket.com/signup

# 4. Build the SDK
npm run build

# 5. Run tests
npm test
```

### Project Structure

```
agent-ads-sdk/
├── src/                  # SDK source code
│   ├── client.ts         # Main client class
│   ├── helpers.ts        # detectIntent, buildTaxonomy, etc.
│   └── types.ts          # TypeScript type definitions
├── supabase/             # Backend (Edge Functions, migrations)
│   └── functions/        # API endpoints (decide, event, etc.)
├── examples/             # Integration examples
├── tests/                # Unit tests
└── dist/                 # Built output (gitignored)
```

---

## 🔄 Pull Request Process

### Before You Submit

1. **Check existing issues/PRs** - Someone might be working on it already
2. **Discuss big changes first** - Open an issue to discuss architecture changes
3. **Write tests** - Add tests for new features or bug fixes
4. **Update docs** - Update README or examples if changing public APIs
5. **Follow TypeScript** - Use strong typing, no `any` unless necessary

### PR Checklist

- [ ] Code builds without errors (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Added tests for new functionality
- [ ] Updated documentation if needed
- [ ] Followed existing code style
- [ ] Clear commit messages
- [ ] PR description explains what and why

### Code Style

We use ESLint and Prettier (auto-formatted). Key points:
- Use TypeScript strict mode
- Descriptive variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Example PR Description

```markdown
## What
Adds support for custom taxonomies in `buildTaxonomy()` helper

## Why
Developers in niche categories (e.g., crypto, gaming) need flexibility beyond Phase 1 taxonomies

## How
- Added optional 5th parameter to buildTaxonomy()
- Updated type definitions
- Added tests for custom taxonomies
- Updated README with example

## Testing
- [ ] Unit tests pass
- [ ] Manually tested with crypto taxonomy
- [ ] No breaking changes to existing API
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- client.test.ts
```

### Writing Tests

We use Vitest. Example:

```typescript
import { describe, it, expect } from 'vitest';
import { buildTaxonomy } from '../src/helpers';

describe('buildTaxonomy', () => {
  it('should build valid taxonomy string', () => {
    const result = buildTaxonomy('insurance', 'auto', 'full_coverage', 'quote');
    expect(result).toBe('insurance.auto.full_coverage.quote');
  });
});
```

---

## 📦 Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Commit: `git commit -m "Release v0.x.x"`
4. Tag: `git tag v0.x.x`
5. Push: `git push && git push --tags`
6. Publish: `npm publish`

---

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** - We're all here to build something great
- **Be constructive** - Critique code, not people
- **Be collaborative** - Help others learn and grow
- **Be patient** - Maintainers are volunteers with day jobs

### Getting Help

- **SDK usage questions** → [Discussions](https://github.com/rtrivedi/agent-ads-sdk/discussions)
- **Bugs** → [Issues](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Feature requests** → [Issues](https://github.com/rtrivedi/agent-ads-sdk/issues) (label: enhancement)
- **Security issues** → Email security@attentionmarket.com (see SECURITY.md)

---

## 🏆 Recognition

Contributors will be:
- Listed in release notes
- Mentioned in CHANGELOG.md
- Featured on our website (if they want)
- Eligible for early access to new features

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 💡 Ideas for Contributions

Not sure where to start? Here are some areas we'd love help with:

### SDK Improvements
- [ ] Add retry logic with exponential backoff
- [ ] Add request caching/deduplication
- [ ] Python SDK port
- [ ] Ruby SDK port
- [ ] Go SDK port

### Documentation
- [ ] More integration examples (LangChain, AutoGPT, etc.)
- [ ] Video tutorial for getting started
- [ ] Blog post: "Building an AI agent that earns"
- [ ] Translations (Spanish, Chinese, etc.)

### Tooling
- [ ] CLI tool for testing taxonomies
- [ ] Playground for testing ad matching
- [ ] Analytics dashboard component
- [ ] React hooks for easy integration

### Testing
- [ ] Integration tests with test backend
- [ ] Performance benchmarks
- [ ] Browser compatibility tests

---

**Thank you for making AttentionMarket better!** 🙏

Questions? Open a [Discussion](https://github.com/rtrivedi/agent-ads-sdk/discussions) or reach out to [@the_ro_show](https://twitter.com/the_ro_show) on Twitter.
