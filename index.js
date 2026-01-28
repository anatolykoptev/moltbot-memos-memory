/**
 * MemOS Memory Plugin for Moltbot
 *
 * Replaces the default memory-core plugin with MemOS-backed
 * semantic memory storage and retrieval.
 */

import { MemosApi } from "./api.js";

/**
 * Format MemOS search results to Moltbot memory_search format
 * MemOS returns: { code, message, data: { text_mem, act_mem, para_mem, pref_mem, tool_mem } }
 * Each *_mem is an array of cubes: [{ cube_id, memories: [...] }]
 */
function formatSearchResults(memosResults, query) {
  const results = [];
  const data = memosResults?.data || {};

  // Process text memories - structure: [{ cube_id, memories: [...] }]
  const textMemCubes = data.text_mem || [];
  for (const cube of textMemCubes) {
    const memories = cube.memories || [];
    for (const mem of memories) {
      results.push({
        id: mem.id || mem.memory_id || `mem-${results.length}`,
        content: mem.memory || mem.memory_content || mem.content || "",
        score: mem.metadata?.relativity || mem.score || 0.5,
        path: "memos://memory/text",
        lines: { start: 1, end: 1 },
        metadata: {
          memory_type: "text_mem",
          cube_id: cube.cube_id,
          tags: mem.metadata?.tags || [],
          created_at: mem.metadata?.created_at,
        },
      });
    }
  }

  // Process preferences - structure: [{ cube_id, memories: [...] }]
  const prefMemCubes = data.pref_mem || [];
  for (const cube of prefMemCubes) {
    const memories = cube.memories || [];
    for (const pref of memories) {
      results.push({
        id: pref.id || pref.memory_id || `pref-${results.length}`,
        content: pref.preference || pref.memory || pref.content || "",
        score: pref.score || 0.8,
        path: "memos://memory/preference",
        lines: { start: 1, end: 1 },
        metadata: {
          memory_type: "preference",
          cube_id: cube.cube_id,
        },
      });
    }
  }

  // Process action memories - structure: [{ cube_id, memories: [...] }]
  const actMemCubes = data.act_mem || [];
  for (const cube of actMemCubes) {
    const memories = cube.memories || [];
    for (const mem of memories) {
      results.push({
        id: mem.id || mem.memory_id || `act-${results.length}`,
        content: mem.memory || mem.memory_content || mem.action || "",
        score: mem.score || 0.5,
        path: "memos://memory/action",
        lines: { start: 1, end: 1 },
        metadata: {
          memory_type: "act_mem",
          cube_id: cube.cube_id,
        },
      });
    }
  }

  return results;
}

/**
 * Create memory_search tool
 */
function createMemorySearchTool(api, config, logger) {
  return {
    label: "Memory Search",
    name: "memory_search",
    description:
      "Semantic memory search using MemOS. Searches all stored memories (facts, preferences, context) ranked by semantic similarity. ALWAYS use at conversation start to recall user context.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Natural language search query",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default: 10)",
        },
        minScore: {
          type: "number",
          description: "Minimum relevance score threshold (0-1)",
        },
      },
      required: ["query"],
    },
    execute: async (_toolCallId, params) => {
      const { query, maxResults = 10, minScore = 0.0 } = params;
      logger?.info?.(`[MEMOS-PLUGIN] memory_search CALLED: query="${query}"`);

      try {
        logger?.info?.(`memory_search: query="${query}", maxResults=${maxResults}`);

        const searchResult = await api.search(query, {
          topK: maxResults,
          userId: config.userId,
        });

        const results = formatSearchResults(searchResult, query)
          .filter((r) => r.score >= minScore)
          .slice(0, maxResults);

        logger?.debug?.(`memory_search: found ${results.length} results`);

        return {
          type: "json",
          data: {
            results,
            query,
            provider: "memos",
            model: "semantic-search",
            fallback: false,
            total: results.length,
          },
        };
      } catch (error) {
        logger?.error?.(`memory_search error: ${error.message}`);

        return {
          type: "json",
          data: {
            results: [],
            query,
            provider: "memos",
            error: error.message,
            fallback: true,
          },
        };
      }
    },
  };
}

/**
 * Create memory_get tool
 */
function createMemoryGetTool(api, config, logger) {
  return {
    label: "Memory Get",
    name: "memory_get",
    description:
      "Retrieve stored memories from MemOS. Returns memory collection for current user. Use to get full overview of remembered context.",
    parameters: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Optional filter string to narrow results",
        },
      },
      required: [],
    },
    execute: async (_toolCallId, params) => {
      const { filter } = params;

      try {
        logger?.debug?.(`memory_get: filter="${filter || "none"}"`);

        const allMemories = await api.getAll({
          userId: config.userId,
          memoryType: "text_mem",
        });

        // Ensure memories is always an array
        let memories = Array.isArray(allMemories?.data) ? allMemories.data : [];

        // Apply simple text filter if provided
        if (filter && memories.length > 0) {
          const lowerFilter = filter.toLowerCase();
          memories = memories.filter((m) => {
            const content = (m.memory_content || m.memory_value || m.content || "").toLowerCase();
            return content.includes(lowerFilter);
          });
        }

        logger?.debug?.(`memory_get: returning ${memories.length} memories`);

        return {
          type: "json",
          data: {
            memories,
            total: memories.length,
            provider: "memos",
          },
        };
      } catch (error) {
        logger?.error?.(`memory_get error: ${error.message}`);

        return {
          type: "json",
          data: {
            memories: [],
            error: error.message,
            provider: "memos",
          },
        };
      }
    },
  };
}

/**
 * Create memory_save tool
 */
function createMemorySaveTool(api, config, logger) {
  return {
    label: "Memory Save",
    name: "memory_save",
    description:
      "Save important information to persistent MemOS memory. Use to remember user preferences, facts, decisions, context. Information is semantically indexed and retrievable via memory_search.",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The information to remember",
        },
      },
      required: ["content"],
    },
    execute: async (_toolCallId, params) => {
      const { content } = params;

      try {
        logger?.debug?.(`memory_save: storing "${content.slice(0, 50)}..."`);

        const result = await api.add(content, {
          userId: config.userId,
        });

        logger?.info?.(`memory_save: saved successfully`);

        return {
          type: "json",
          data: {
            success: true,
            message: "Memory saved successfully",
            provider: "memos",
          },
        };
      } catch (error) {
        logger?.error?.(`memory_save error: ${error.message}`);

        return {
          type: "json",
          data: {
            success: false,
            error: error.message,
            provider: "memos",
          },
        };
      }
    },
  };
}

/**
 * Plugin definition
 */
const memosMemoryPlugin = {
  id: "memos-memory",
  name: "Memory (MemOS)",
  description: "MemOS-backed semantic memory with persistent storage and vector search",
  kind: "memory",
  configSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      apiUrl: {
        type: "string",
        description: "MemOS API URL",
        default: "http://memos-api:8000",
      },
      userId: {
        type: "string",
        description: "Default user ID for memory operations",
        default: "default",
      },
      topK: {
        type: "number",
        description: "Number of results to return from search",
        default: 10,
      },
    },
  },

  register(api) {
    const pluginConfig = api.pluginConfig || {};
    const config = {
      apiUrl: pluginConfig.apiUrl || process.env.MEMOS_API_URL || "http://memos-api:8000",
      userId: pluginConfig.userId || process.env.MEMOS_USER_ID || "default",
      topK: pluginConfig.topK || 10,
    };

    const logger = api.logger;

    // Get API key from environment for authentication
    const apiKey = process.env.INTERNAL_SERVICE_SECRET || null;

    logger?.info?.(`Initializing MemOS memory plugin with API: ${config.apiUrl}`);
    if (apiKey) {
      logger?.info?.(`MemOS API authentication enabled (key: ${apiKey.substring(0, 8)}...)`);
    } else {
      logger?.warn?.("MemOS API: No INTERNAL_SERVICE_SECRET found - requests may fail with 401");
    }

    // Create API client with optional authentication
    const memosApi = new MemosApi(config.apiUrl, config.userId, apiKey);

    // Register tools
    api.registerTool(
      () => {
        return [
          createMemorySearchTool(memosApi, config, logger),
          createMemoryGetTool(memosApi, config, logger),
          createMemorySaveTool(memosApi, config, logger),
        ];
      },
      { names: ["memory_search", "memory_get", "memory_save"] }
    );

    // Register session_end hook for cleanup
    api.on("session_end", async (event, ctx) => {
      try {
        logger?.debug?.("Session ended, memory plugin cleanup");
      } catch (error) {
        logger?.error?.(`Session end hook error: ${error.message}`);
      }
    });

    logger?.info?.("MemOS memory plugin registered successfully");
  },
};

export default memosMemoryPlugin;
