import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all agents
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

// Get agent by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const agents = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();
    return agents[0] || null;
  },
});

// Get agents by status
export const byStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();
  },
});

// Create agent
export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    domain: v.string(),
    emoji: v.string(),
    responsibilities: v.array(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      status: "idle",
      lastActive: Date.now(),
    });
  },
});

// Update agent status
export const updateStatus = mutation({
  args: {
    name: v.string(),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("blocked"), v.literal("complete")),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agents = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();
    
    if (agents[0]) {
      await ctx.db.patch(agents[0]._id, {
        status: args.status,
        currentTask: args.currentTask,
        lastActive: Date.now(),
      });
    }
  },
});

// Seed initial agents
export const seedAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const existingAgents = await ctx.db.query("agents").collect();
    if (existingAgents.length > 0) return "Already seeded";

    const agents = [
      {
        name: "Bellatrix",
        role: "Chief of Staff / Orchestrator",
        domain: "Everything",
        emoji: "🖤",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "Direct communication with the Dark Lord",
          "Delegate tasks to appropriate agents",
          "Strategic planning and prioritization",
          "System maintenance and improvements",
        ],
      },
      {
        name: "Jovie",
        role: "CEO of The Best Christmas",
        domain: "thebestchristmas.com",
        emoji: "🎄",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "Christmas content strategy and creation",
          "Gift guides and seasonal content",
          "Site improvements and page scoring",
        ],
      },
      {
        name: "Skeeter",
        role: "Content Writer & SEO",
        domain: "All sites - written content",
        emoji: "📝",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "Blog posts and articles",
          "SEO-optimized content",
          "Keyword research",
        ],
      },
      {
        name: "Severus",
        role: "Technical SEO Engineer",
        domain: "All sites - technical",
        emoji: "🔧",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "Site speed optimization",
          "Schema markup",
          "Technical audits",
        ],
      },
      {
        name: "Varys",
        role: "Research & Intelligence",
        domain: "All projects - research",
        emoji: "🕵️",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "Competitor analysis",
          "Market research",
          "SaaS idea validation",
        ],
      },
      {
        name: "Lockhart",
        role: "Social Media Manager",
        domain: "All brands - social",
        emoji: "📣",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "Twitter/X content",
          "Community engagement",
          "Brand voice on social",
        ],
      },
      {
        name: "Regulus",
        role: "Directory Content Specialist",
        domain: "Directory sites",
        emoji: "⭐",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "Business reviews",
          "Directory content",
          "Local SEO content",
        ],
      },
      {
        name: "Pixel",
        role: "UI/UX Designer",
        domain: "All projects - visual",
        emoji: "🎨",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "UI/UX design",
          "Image generation",
          "Frontend styling",
        ],
      },
      {
        name: "Dobby",
        role: "Full-Stack Developer",
        domain: "All projects - code",
        emoji: "💻",
        status: "idle" as const,
        lastActive: Date.now(),
        responsibilities: [
          "Feature development",
          "Bug fixes",
          "API integrations",
        ],
      },
    ];

    for (const agent of agents) {
      await ctx.db.insert("agents", agent);
    }

    return "Seeded " + agents.length + " agents";
  },
});
