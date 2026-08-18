import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser, mockUnauthenticated } from "../../test/mock-auth";

describe("submitFeedback", () => {
  let userId: string;
  const originalToken = process.env.GITHUB_TOKEN;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    userId = randomUUID();
    await prisma.user.create({
      data: { id: userId, email: `reporter-${userId}@test.com`, role: "student" },
    });
    process.env.GITHUB_TOKEN = "test-token";
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
    process.env.GITHUB_TOKEN = originalToken;
    global.fetch = originalFetch;
  });

  it("files a GitHub issue with the reporter's context when authenticated", async () => {
    mockAuthenticatedUser(userId);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ html_url: "https://github.com/fjdvm/fr-gaits/issues/1", number: 1 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { submitFeedback } = await import("@/app/actions/feedback");
    const result = await submitFeedback("Bug in editor", "Steps to reproduce...", "/dashboard/student");

    expect(result.success).toBe(true);
    expect(result.issueNumber).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.github.com/repos/fjdvm/fr-gaits/issues");
    const payload = JSON.parse(options.body);
    expect(payload.title).toBe("Bug in editor");
    expect(payload.body).toContain(`reporter-${userId}@test.com`);
    expect(payload.labels).toContain("user-feedback");
  });

  it("allows an unauthenticated caller to file an issue anonymously", async () => {
    mockUnauthenticated();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ html_url: "https://github.com/fjdvm/fr-gaits/issues/2", number: 2 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { submitFeedback } = await import("@/app/actions/feedback");
    const result = await submitFeedback("Bug", "Description", "/");

    expect(result.success).toBe(true);
    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload.body).toContain("anonymous");
  });

  it("rejects when title is missing", async () => {
    mockAuthenticatedUser(userId);
    const { submitFeedback } = await import("@/app/actions/feedback");

    const result = await submitFeedback("", "Description", "/dashboard/student");

    expect(result.success).toBe(false);
  });

  it("returns an error when the GitHub API call fails", async () => {
    mockAuthenticatedUser(userId);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Bad credentials",
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { submitFeedback } = await import("@/app/actions/feedback");
    const result = await submitFeedback("Bug", "Description", "/dashboard/student");

    expect(result.success).toBe(false);
  });
});
