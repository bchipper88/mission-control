import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Agent/Team members
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    domain: v.string(),
    emoji: v.string(),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("blocked"), v.literal("complete")),
    currentTask: v.optional(v.string()),
    lastActive: v.number(),
    avatarUrl: v.optional(v.string()),
    responsibilities: v.array(v.string()),
  }).index("by_status", ["status"]),

  // Memories
  memories: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()), // e.g., "MEMORY.md", "memory/2026-02-19.md"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_created", ["createdAt"])
    .searchIndex("search_memories", {
      searchField: "content",
      filterFields: ["category"],
    }),

  // Tasks
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("done")
    ),
    assignedTo: v.string(), // "john" or agent name
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_assigned", ["assignedTo"]),

  // Activity log
  activity: defineTable({
    agentName: v.string(),
    action: v.string(),
    description: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
