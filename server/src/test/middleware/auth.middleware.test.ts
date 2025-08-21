import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { authenticateToken, type AuthRequest } from "../../middleware/auth.middleware";

vi.mock("jsonwebtoken", () => ({
	default: {
		verify: vi.fn((token: string, _secret: string, cb: any) => {
			if (token === "bad") return cb(new Error("invalid"));
			cb(null, { sub: 42 });
		})
	}
}));

describe("authenticateToken", () => {
	const makeRes = () => {
		const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
		return res;
	};

	it("401 when no token", () => {
		const req = { headers: {}, cookies: {} } as unknown as AuthRequest;
		const res = makeRes();
		const next = vi.fn();
		authenticateToken(req, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("401 when invalid token", () => {
		const req = { headers: { authorization: "Bearer bad" } } as unknown as AuthRequest;
		const res = makeRes();
		const next = vi.fn();
		authenticateToken(req, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("sets req.userId and calls next on valid token", () => {
		const req = { headers: { authorization: "Bearer good" } } as unknown as AuthRequest;
		const res = makeRes();
		const next = vi.fn();
		authenticateToken(req, res, next);
		expect((req as any).userId).toBe(42);
		expect(next).toHaveBeenCalled();
	});

	it("401 when payload missing sub", () => {
		(jwt.verify as any).mockImplementationOnce((_t: string, _s: string, cb: any) => cb(null, { notSub: 1 }));
		const req = { headers: { authorization: "Bearer good" } } as unknown as AuthRequest;
		const res = makeRes();
		const next = vi.fn();
		authenticateToken(req, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});
});
