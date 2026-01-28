# moltbot-memos-memory

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js->=18-green.svg)](https://nodejs.org/)

A [Moltbot](https://github.com/moltbot/moltbot) plugin that provides semantic memory powered by [MemOS](https://github.com/MemTensor/MemOS) — persistent storage with vector search capabilities.

## Features

- **Semantic Search** — Find memories by meaning, not just keywords
- **Persistent Storage** — PostgreSQL + pgvector backend
- **Auto-indexing** — Memories are automatically embedded and indexed
- **Preference Tracking** — Remembers user preferences and context

## Installation

### As Moltbot Extension

Clone into your Moltbot extensions directory:

```bash
cd ~/.moltbot/extensions
git clone https://github.com/anatolykoptev/moltbot-memos-memory.git memos-memory
```

### Docker (recommended)

The plugin is designed to work with a MemOS backend. See the Docker setup below.

## Configuration

Add to your `moltbot.json`:

```json
{
  "plugins": {
    "slots": {
      "memory": "memos-memory"
    },
    "entries": {
      "memos-memory": {
        "enabled": true,
        "config": {
          "apiUrl": "http://memos-api:8000",
          "userId": "default",
          "topK": 10
        }
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MEMOS_API_URL` | MemOS API endpoint | `http://memos-api:8000` |
| `MEMOS_USER_ID` | Default user ID | `default` |
| `INTERNAL_SERVICE_SECRET` | API key for MemOS authentication | — |

### Authentication

If your MemOS API has `AUTH_ENABLED=true`, the plugin will automatically use `INTERNAL_SERVICE_SECRET` from environment for Bearer token authentication. Make sure to pass this variable to your Moltbot container.

## Provided Tools

### `memory_search`

Semantic search across all stored memories.

```
Query: "What did we discuss about the project deadline?"
```

### `memory_save`

Save important information to persistent memory.

```
Content: "User prefers TypeScript over JavaScript for new projects"
```

### `memory_get`

Retrieve all memories with optional filtering.

## Requirements

- **MemOS API** — Running and accessible
- **PostgreSQL** — With pgvector extension
- **Embedding Service** — For vector generation

## Docker Compose Example

```yaml
services:
  moltbot:
    image: your-moltbot-image
    volumes:
      - ./extensions/memos-memory:/home/node/.moltbot/extensions/memos-memory
    depends_on:
      - memos-api

  memos-api:
    image: your-memos-api-image
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/memos
    depends_on:
      - postgres
      - embedding-service

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_DB=memos
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  embedding-service:
    image: your-embedding-service
```

## API Reference

The plugin communicates with MemOS API:

- `POST /api/v1/memory/search` — Semantic search
- `POST /api/v1/memory/add` — Add new memory
- `GET /api/v1/memory/list` — List all memories

## License

MIT
