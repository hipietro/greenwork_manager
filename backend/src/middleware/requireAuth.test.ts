import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { requireAuth, requireWriteAccess } from "./requireAuth";

function responseMock() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe("demo authorization", () => {
  it("hydrates the role from a valid JWT", () => {
    const token = jwt.sign(
      { userId: 2, username: "demo", role: "DEMO" },
      "test-secret-at-least-32-characters"
    );
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const next = vi.fn() as NextFunction;

    requireAuth(req, responseMock(), next);

    expect(req.user).toEqual({ userId: 2, username: "demo", role: "DEMO" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 403 for a demo mutation", () => {
    const req = { user: { userId: 2, username: "demo", role: "DEMO" } } as Request;
    const res = responseMock();
    const next = vi.fn() as NextFunction;

    requireWriteAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "DEMO_READ_ONLY" }));
    expect(next).not.toHaveBeenCalled();
  });

  it("keeps write access for admins", () => {
    const req = { user: { userId: 1, username: "admin", role: "ADMIN" } } as Request;
    const next = vi.fn() as NextFunction;

    requireWriteAccess(req, responseMock(), next);

    expect(next).toHaveBeenCalledOnce();
  });
});
