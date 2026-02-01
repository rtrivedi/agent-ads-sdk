# Security Policy

## API Key Management

**IMPORTANT**: Never commit API keys to version control.

Your AttentionMarket API key (`am_live_...` or `am_test_...`) provides access to your agent's account and billing. Follow these best practices:

### Environment Variables

Store your API key in environment variables, not in code:

```bash
export ATTENTIONMARKET_API_KEY=am_live_...
```

Then use it in your application:

```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
});
```

### .gitignore

Ensure your `.gitignore` includes:

```
.env
.env.local
.env.*.local
```

### Production Deployments

- Use secure secret management systems (AWS Secrets Manager, GitHub Secrets, etc.)
- Rotate API keys periodically
- Use `am_test_...` keys for development and testing
- Use `am_live_...` keys only in production environments

## Reporting Security Issues

If you discover a security vulnerability in this SDK, please email security@attentionmarket.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact

Do not open public GitHub issues for security vulnerabilities.
