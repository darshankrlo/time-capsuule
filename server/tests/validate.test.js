import { jest } from "@jest/globals";
import { z } from "zod";
import { validate } from "../src/middleware/validate.js";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

describe("validate middleware", () => {
  test("calls next() with no error on valid body", () => {
    const req = { body: { email: "a@b.com", password: "password123" } };
    const next = jest.fn();
    validate(schema)(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  test("calls next(error) with status 400 on invalid body", () => {
    const req = { body: { email: "nope", password: "123" } };
    const next = jest.fn();
    validate(schema)(req, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
  });
});