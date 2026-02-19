import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all memories
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("memories")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
  },
});

// Get memories by category
export const byCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Search memories
export const search = query({
  args: { query: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let searchQuery = ctx.db
      .query("memories")
      .withSearchIndex("search_memories", (q) => {
        let search = q.search("content", args.query);
        if (args.category) {
          search = search.eq("category", args.category);
        }
        return search;
      });
    
    return await searchQuery.take(20);
  },
});

// Create memory
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("memories", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update memory
export const update = mutation({
  args: {
    id: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

// Delete memory
export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get unique categories
export const categories = query({
  args: {},
  handler: async (ctx) => {
    const memories = await ctx.db.query("memories").collect();
    const cats = [...new Set(memories.map((m) => m.category))];
    return cats.sort();
  },
});

// Import memories from markdown (for syncing with existing files)
export const importBatch = mutation({
  args: {
    memories: v.array(
      v.object({
        title: v.string(),
        content: v.string(),
        category: v.string(),
        tags: v.array(v.string()),
        source: v.optional(v.string()),
        createdAt: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let count = 0;
    
    for (const memory of args.memories) {
      await ctx.db.insert("memories", {
        title: memory.title,
        content: memory.content,
        category: memory.category,
        tags: memory.tags,
        source: memory.source,
        createdAt: memory.createdAt || now,
        updatedAt: now,
      });
      count++;
    }
    
    return { imported: count };
  },
});
