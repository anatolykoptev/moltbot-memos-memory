# Contributing

Contributions and issues are welcome. For anything larger than a fix, open an issue first.

## Build and test

There is no build step, no dependencies and no test suite. Check your change with:

```sh
node --check index.js && node --check api.js
node -e "import('./index.js').then(m => console.log(m.default.id))"
```

and exercise the tools against a MemOS API you control. Node.js 18 or newer.

## Pull requests

- Branch from `main`, one concern per pull request.
- Use Conventional Commits as in the history (`feat:`, `fix:`, `refactor:`, `docs:`).
- Keep `package.json` and `moltbot.plugin.json` versions equal, and update the configuration table in
  [README.md](README.md) when an option changes.
- Never commit an API key or log one; report vulnerabilities as described in [SECURITY.md](SECURITY.md).
- Add new documents to [docs/INDEX.md](docs/INDEX.md) and notable changes to [CHANGELOG.md](CHANGELOG.md).
