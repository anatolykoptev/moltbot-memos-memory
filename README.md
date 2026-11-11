# moltbot-memos-memory

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js->=18-green.svg)](https://nodejs.org/)

A [Moltbot](https://github.com/moltbot/moltbot) memory plugin backed by [MemOS](https://github.com/MemTensor/MemOS):
three agent tools that search, list and save memories through a MemOS HTTP API. The MemOS server does
the embedding, vector storage and search; this plugin is the client. It is for people running Moltbot
with a MemOS backend. (The sibling plugin for Clawdbot is
[clawdbot-memos-memory](https://github.com/anatolykoptev/clawdbot-memos-memory).)

## Tools

| Tool | What it does |
|---|---|
| `memory_search` | Semantic search (`query`, optional `maxResults` default 10, `minScore` default 0). Calls MemOS in `fast` mode and includes preference memories. |
| `memory_get` | Lists the user's stored text memories, with an optional `filter` string. |
| `memory_save` | Stores `content`. The call returns at once and the save finishes in the background; a failure is only logged. |

## Install

Requires Node.js 18 or newer. Clone into the Moltbot extensions directory:

```sh
cd ~/.moltbot/extensions
git clone https://github.com/anatolykoptev/moltbot-memos-memory.git memos-memory
```

There is no build step and no npm dependency.

## Configuration

Select the plugin for the memory slot in `moltbot.json`:

```json
{
  "plugins": {
    "slots": { "memory": "memos-memory" },
    "entries": {
      "memos-memory": {
        "enabled": true,
        "config": { "apiUrl": "http://memos-api:8000", "userId": "default", "topK": 10 }
      }
    }
  }
}
```

| Plugin option | Environment fallback | Default |
|---|---|---|
| `apiUrl` | `MEMOS_API_URL` | `http://memos-api:8000` |
| `userId` | `MEMOS_USER_ID` | `default` |
| `topK` | none | `10` |

`INTERNAL_SERVICE_SECRET` is read from the environment, never from the plugin config. When set, it is
sent as the `X-Internal-Service` header (a leading `krlk_` prefix is removed first). Without it
the plugin still starts and logs a warning, and requests fail if the server requires authentication.
Pass the variable to the Moltbot process or container. Note that `topK` is declared in the config but
the search tool uses its own `maxResults` argument (default 10).

## MemOS endpoints used

All are `POST` under the `apiUrl`: `/product/search`, `/product/add` (asynchronous embedding),
`/product/get_all` and `/product/delete_memory`. The server must provide these routes.

## Status

Version 1.0.1, small and stable: the code is `index.js` (tools and plugin registration) and `api.js`
(HTTP client with per-call timeouts: 10 s search, 30 s save, 20 s list, 15 s delete). Contributions
and issues are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Apache-2.0; see [LICENSE](LICENSE). Agent notes: [CLAUDE.md](CLAUDE.md); all documents: [docs/INDEX.md](docs/INDEX.md).
