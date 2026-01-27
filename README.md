# Clawdbot MemOS Memory Plugin

A [Clawdbot](https://github.com/clawdbot/clawdbot) plugin that replaces the default memory system with [MemOS](https://github.com/MemTensor/MemOS) — a semantic memory operating system with persistent storage and vector search.

## Features

- 🧠 **Semantic Search** — Find memories by meaning, not just keywords
- 💾 **Persistent Storage** — PostgreSQL + pgvector backend
- 🔄 **Auto-indexing** — Memories are automatically embedded and indexed
- 🎯 **Preference Tracking** — Remembers user preferences
- 🛠 **Tool Memory** — Stores and retrieves tool execution history

## Installation

```bash
clawdbot plugins install github:koptev/clawdbot-memos-memory
```

Or with npm:

```bash
clawdbot plugins install @koptev/clawdbot-memos-memory
```

## Configuration

Add to your `clawdbot.json`:

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

## Tools

The plugin provides three tools:

### `memory_search`
Semantic search across all stored memories.

```
Query: "What are my preferences for coffee?"
```

### `memory_save`
Save important information to persistent memory.

```
Content: "User prefers dark roast coffee in the morning"
```

### `memory_get`
Retrieve all memories with optional filtering.

## Requirements

- MemOS API server running and accessible
- PostgreSQL with pgvector extension
- Embedding service (for vector generation)

## Docker Setup

See [krolik-server](https://github.com/koptev/krolik-server) for a complete Docker Compose setup with:
- Clawdbot
- MemOS API
- PostgreSQL + pgvector
- Embedding service
- Qdrant (optional)

## License

MIT
