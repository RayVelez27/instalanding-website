import { describe, it, expect } from "vitest";
import { getPromptBySlug, getRelatedPrompts, prompts, slugify } from "@/data/prompts";

describe("prompt slugs", () => {
  it("derives url-safe slugs from titles", () => {
    expect(slugify("Search with Modal Command Palette")).toBe("search-with-modal-command-palette");
    expect(slugify("Scroll-Reveal Sections")).toBe("scroll-reveal-sections");
  });

  it("gives every prompt a unique slug", () => {
    const slugs = prompts.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(prompts.length);
    expect(slugs.every((s) => /^[a-z0-9-]+$/.test(s))).toBe(true);
  });

  it("looks a prompt up by slug", () => {
    expect(getPromptBySlug(prompts[0].slug)).toBe(prompts[0]);
    expect(getPromptBySlug("nope")).toBeUndefined();
    expect(getPromptBySlug(undefined)).toBeUndefined();
  });

  it("relates prompts by category, excluding itself", () => {
    const related = getRelatedPrompts(prompts[0]);
    expect(related.every((r) => r.category === prompts[0].category)).toBe(true);
    expect(related.some((r) => r.slug === prompts[0].slug)).toBe(false);
  });
});
