/**
 * MemOS API Client
 * Handles communication with MemOS REST API
 */

export class MemosApi {
  constructor(baseUrl, defaultUserId = "default") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.defaultUserId = defaultUserId;
  }

  async search(query, options = {}) {
    const { topK = 10, userId = this.defaultUserId } = options;

    const response = await fetch(`${this.baseUrl}/product/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        user_id: userId,
        top_k: topK,
        mode: "fast",
        include_preference: true,
        search_tool_memory: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`MemOS search failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async add(content, options = {}) {
    const { userId = this.defaultUserId, sessionId = "default_session" } = options;

    const response = await fetch(`${this.baseUrl}/product/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        async_mode: "sync",
        mode: "fast",
        messages: content,
      }),
    });

    if (!response.ok) {
      throw new Error(`MemOS add failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getAll(options = {}) {
    const { userId = this.defaultUserId, memoryType = "text_mem" } = options;

    const response = await fetch(`${this.baseUrl}/product/get_all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        memory_type: memoryType,
      }),
    });

    if (!response.ok) {
      throw new Error(`MemOS get_all failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async delete(memoryIds, options = {}) {
    const { userId = this.defaultUserId } = options;

    const response = await fetch(`${this.baseUrl}/product/delete_memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        writable_cube_ids: ["default"],
        memory_ids: memoryIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`MemOS delete failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
