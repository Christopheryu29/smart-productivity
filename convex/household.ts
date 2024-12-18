import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to set the household data
export const setHousehold = mutation({
  args: {
    numAdults: v.number(),
    numChildren: v.number(),
  },
  handler: async (ctx, { numAdults, numChildren }) => {
    // Get the authenticated user's identity
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Check if there's an existing entry for the user
    const existing = await ctx.db
      .query("household")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      // Update existing entry
      return await ctx.db.patch(existing._id, {
        numAdults,
        numChildren,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      // Create new entry
      return await ctx.db.insert("household", {
        userId,
        numAdults,
        numChildren,
        lastUpdated: new Date().toISOString(),
      });
    }
  },
});

// Query to get household data by user ID
export const getHouseholdByUserId = query({
  handler: async (ctx) => {
    // Get the authenticated user's identity
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    return await ctx.db
      .query("household")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
  },
});
