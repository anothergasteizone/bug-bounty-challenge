import { describe, it, expect } from "vitest";
import { resultOrError } from "./global";

describe("resultOrError", () => {
  it("returns [result, null] when the promise resolves", async () => {
    const [result, error] = await resultOrError(Promise.resolve(42));

    expect(result).toBe(42);
    expect(error).toBeNull();
  });

  it("returns [null, Error] when the promise rejects with an Error", async () => {
    const [result, error] = await resultOrError(
      Promise.reject(new Error("boom"))
    );

    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("boom");
  });

  it("normalizes a non-Error rejection into an Error", async () => {
    const [result, error] = await resultOrError(
      Promise.reject("plain string rejection")
    );

    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("plain string rejection");
  });
});
