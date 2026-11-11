# CLAUDE.md

Notes for coding agents. Overview and configuration: [README.md](README.md); all documents:
[docs/INDEX.md](docs/INDEX.md).

## Layout

- `index.js` the plugin: tool factories (`memory_search`, `memory_get`, `memory_save`), result
  normalisation for MemOS cubes (`text_mem`, `pref_mem`, `act_mem`) and `register(api)`.
- `api.js` `MemosApi`, the fetch-based client with per-call timeouts and the auth header.
- `moltbot.plugin.json` plugin manifest: id `memos-memory`, config schema and UI hints.
- `package.json` ESM package, Node >= 18, no dependencies.

## Gate

There is no CI, no test suite and no build. Before a commit run a syntax check and load the module:

```sh
node --check index.js && node --check api.js
node -e "import('./index.js').then(m => console.log(m.default.id))"
```

## Invariants easy to break

- Keep the version in `package.json` and `moltbot.plugin.json` equal.
- `additionalProperties` is `false` in the config schema: a new option must be added to the schema
  and `uiHints` as well as to `register()`.
- `memory_save` deliberately does not await the HTTP call (agent timeout). Do not make a failure
  throw out of the tool without changing that contract.
- The API key reaches the plugin only through `INTERNAL_SERVICE_SECRET`; never put it in plugin config
  and never log it or part of it.
- Result mapping tolerates several MemOS response shapes and non-array fields; keep the defensive
  array guards before `.filter` / `.some`.
