import { beforeEach, describe, expect, it, vi } from "vitest";

const afterCallbacks: Array<() => void | Promise<void>> = [];

vi.mock("next/server", async () => {
  const actual = await vi.importActual<
    typeof import("next/server")
  >("next/server");

  return {
    ...actual,
    after: (callback: () => void | Promise<void>) => {
      afterCallbacks.push(callback);
    },
  };
});

const fetchMetadata = vi.fn();
const trackEvent = vi.fn();
const createLink = vi.fn();
const getAllLinks = vi.fn();
const getLinkByUrl = vi.fn();
const updateLink = vi.fn();

vi.mock("@/lib/metadata", () => ({
  fetchMetadata,
}));

vi.mock("@/lib/tracking", () => ({
  trackEvent,
}));

vi.mock("@/lib/linkRepository", () => ({
  createLink,
  getAllLinks,
  getLinkByUrl,
  updateLink,
}));

describe("POST /api/links", () => {
  beforeEach(() => {
    afterCallbacks.length = 0;
    vi.clearAllMocks();
  });

  it("returns a pending link immediately and defers metadata processing", async () => {
    getLinkByUrl.mockReturnValue(undefined);
    fetchMetadata.mockResolvedValue({
      url: "https://example.com",
      title: "Example",
      description: "Example description",
      fetchedAt: new Date().toISOString(),
    });

    const { POST } = await import("@/app/api/links/route");

    const response = await POST(
      new Request("http://localhost/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com",
        }),
      }) as never
    );

    expect(response.status).toBe(202);

    await expect(response.json()).resolves.toMatchObject({
      url: "https://example.com",
      status: "pending",
      title: null,
      description: null,
      error: null,
    });

    expect(afterCallbacks).toHaveLength(1);
    expect(fetchMetadata).not.toHaveBeenCalled();
  });
});
