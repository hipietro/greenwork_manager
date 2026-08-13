import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, clearAuthSession, getAuthUser, isDemoUser, setAuthSession } from "./api";

describe("demo frontend session", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("persists and clears the authenticated role", () => {
    setAuthSession("token", { id: 2, username: "demo", role: "DEMO" });
    expect(getAuthUser()?.role).toBe("DEMO");
    expect(isDemoUser()).toBe(true);

    clearAuthSession();
    expect(getAuthUser()).toBeNull();
  });

  it("blocks demo mutations before sending a request", async () => {
    setAuthSession("token", { id: 2, username: "demo", role: "DEMO" });
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(apiRequest("/employees", { method: "POST", body: {} }))
      .rejects.toThrow("sola lettura");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
